import logging
from typing import List, Tuple
import json
from functools import lru_cache
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage, AIMessage, SystemMessage
from vector_store import get_vectorstore
from config import get_settings
from admission_predictor import predict_admission, career_orientation

logger = logging.getLogger(__name__)
settings = get_settings()

SYSTEM_PROMPT = """Bạn là trợ lý tư vấn tuyển sinh thân thiện của Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM (HCMUS).

Nhiệm vụ của bạn:
- Trả lời các câu hỏi về tuyển sinh, ngành học, điểm chuẩn, học phí... một cách tự nhiên như một người tư vấn viên thực thụ.

Nguyên tắc trả lời (TUYỆT ĐỐI TUÂN THỦ ĐỂ TĂNG TỐC ĐỘ):
1. Văn phong đầy đủ, tự nhiên, mạch lạc (không quá cụt ngủn nhưng cũng không lan man).
2. TUYỆT ĐỐI KHÔNG liệt kê dài dòng các phương thức xét tuyển, khối thi hay thông tin râu ria nếu người dùng không yêu cầu rõ ràng.
3. Bao quát thông tin: Nếu người dùng hỏi điểm, hãy đọc kỹ tài liệu để trả lời bao gồm cả điểm ĐGNL (Phương thức 3) và điểm THPT nếu có trong tài liệu.
4. Giọng văn tự nhiên: Thân thiện, gần gũi.
5. CHỐT CÂU LUÔN GỢI Ý WEB TRƯỜNG: Ở cuối mỗi câu trả lời, LUÔN LUÔN có một câu khuyên thí sinh tham khảo thêm tại website chính thức hcmus.edu.vn.

(Dữ liệu điểm chuẩn, ngành học, học phí, v.v. được cung cấp trong các đoạn văn bản trích xuất từ tài liệu PDF. Hãy tự đọc, phân tích và trả lời chính xác dựa trên các tài liệu đó).

Thông tin liên hệ trường:
- Website: hcmus.edu.vn
- Địa chỉ: 227 Nguyễn Văn Cừ, Phường 4, Quận 5, TP.HCM
- Email: tuyensinh@hcmus.edu.vn  
- Điện thoại: (028) 38 354 266
"""

SYSTEM_PROMPT_EN = """You are a friendly admission counseling assistant for the University of Science, VNU-HCM (HCMUS).

Your responsibilities:
- Answer questions about admissions, programs, scores, tuition fees... naturally like a real counselor.

Answering principles:
1. Be concise: Only select and answer the most important points that directly address the question. Do NOT list everything if not necessary.
2. Cover admission methods: When asked about cutoff scores, note if there are multiple admission methods (e.g., National Exam, ĐGNL Aptitude Test, Priority Admission) or similar program branches (standard, advanced, honors). Provide comprehensive scores.
3. Natural tone: Friendly, approachable, avoid robotic or formulaic responses.
4. Always mention the official website: At the end of each answer, kindly remind students to check hcmus.edu.vn for the most updated and accurate results.
5. If the documents don't contain the information, honestly say you don't have this information and advise contacting the university directly.

University contact information:
- Website: hcmus.edu.vn
- Address: 227 Nguyen Van Cu, Ward 4, District 5, Ho Chi Minh City, Vietnam
- Email: tuyensinh@hcmus.edu.vn
- Phone: (+84) 28 38 354 266
"""

INTENT_PROMPT = """Bạn là hệ thống phân loại ý định (intent classifier). 
Hãy phân loại câu hỏi sau vào ĐÚNG MỘT trong 3 loại:

1. "predict" - Người dùng muốn DỰ ĐOÁN KHẢ NĂNG ĐẬU một ngành cụ thể. Họ thường đề cập đến điểm số cụ thể + tên ngành cụ thể.
   Ví dụ: "Em được 26.5 điểm khối A00, có đậu CNTT không?", "Khả năng đậu Trí tuệ nhân tạo với 28 điểm?"

2. "orient" - Người dùng muốn được ĐỊNH HƯỚNG/GỢI Ý NGÀNH PHÙ HỢP. Họ thường mô tả sở thích, tính cách, hoàn cảnh tài chính, môn giỏi.
   Ví dụ: "Em thích lập trình, nên học ngành gì?", "Em hướng nội, giỏi Toán, gia đình khoảng 30 triệu, nên chọn ngành nào?"

3. "general" - Tất cả các câu hỏi khác (hỏi thông tin chung, điểm chuẩn, học phí, KTX, học bổng...).
   Ví dụ: "Trường có những ngành nào?", "Điểm chuẩn năm 2025?", "Học phí bao nhiêu?"

Chỉ trả về ĐÚNG MỘT từ: predict, orient, hoặc general. Không giải thích gì thêm.

Câu hỏi: {question}"""

EXTRACT_PREDICT_PROMPT = """Từ câu hỏi sau, hãy trích xuất thông tin dưới dạng JSON:
{{
  "score": <điểm số (float)>,
  "method": "<khối thi hoặc DGNL, ví dụ: A00, A01, B00, D07, DGNL>",
  "major": "<tên ngành muốn xét>"
}}

Lưu ý:
- Nếu không rõ khối thi, mặc định là "A00"
- Nếu không rõ điểm, đặt score = 0
- Tên ngành cần giữ nguyên tiếng Việt

Chỉ trả về JSON, không giải thích gì thêm.

Câu hỏi: {question}"""

EXTRACT_ORIENT_PROMPT = """Từ câu hỏi sau, hãy trích xuất thông tin dưới dạng JSON:
{{
  "interests": ["<sở thích 1>", "<sở thích 2>", ...],
  "personality": ["<tính cách 1>", "<tính cách 2>", ...],
  "budget": <học phí tối đa triệu/năm hoặc null nếu không đề cập>,
  "strengths": ["<môn giỏi 1>", "<môn giỏi 2>", ...]
}}

Lưu ý:
- interests: Các từ khóa về sở thích hoặc lĩnh vực quan tâm (VD: lập trình, robot, y khoa, môi trường)
- personality: Tính cách (VD: hướng nội, sáng tạo, kiên nhẫn, thích nghiên cứu)
- budget: Nếu đề cập đến tài chính/tiền bạc, ước tính con số triệu/năm. Nếu nói "gia đình khó khăn" hoặc "không muốn đóng nhiều" thì đặt 25. Nếu không đề cập thì null.
- strengths: Các môn học giỏi (VD: Toán, Lý, Hóa, Sinh, Anh, Tin)

Chỉ trả về JSON, không giải thích gì thêm.

Câu hỏi: {question}"""


import random

def get_random_api_key():
    keys = [k.strip() for k in settings.gemini_api_keys.split(",") if k.strip()]
    if not keys:
        return settings.google_api_key
    selected_key = random.choice(keys)
    logger.info(f"Selected API Key starting with: {selected_key[:10]}...")
    return selected_key

def get_llm():
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=get_random_api_key(),
        temperature=0.3,
        max_retries=3,
    )


def get_fast_llm():
    """LLM for extraction/summary tasks."""
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=get_random_api_key(),
        temperature=0.1,
        max_retries=3,
    )


def _extract_text_from_response(response) -> str:
    """Safely extract text from LLM response, handling list-type content."""
    if isinstance(response.content, list):
        return str(response.content[-1]).strip()
    return str(response.content).strip()


# Từ khóa để phát hiện nhanh intent (không cần gọi LLM)
_PREDICT_KEYWORDS = ["đậu", "đỗ", "trượt", "khả năng", "cơ hội", "được không", "có vào được", "điểm", "dự đoán", "trúng tuyển", "xét tuyển", "pass", "admission chance", "có đậu", "rớt", "tỷ lệ"]
_ORIENT_KEYWORDS = ["nên học", "ngành nào", "phù hợp", "gợi ý", "định hướng", "chọn ngành", "học gì", "ngành gì", "tư vấn ngành", "suggest", "recommend", "thích hợp", "career", "nghề nghiệp", "tương lai"]


def detect_intent(question: str) -> str:
    """Phát hiện intent bằng keyword matching (nhanh) trước, fallback sang LLM nếu cần."""
    q = question.lower()
    
    # Kiểm tra nhanh bằng từ khóa
    has_score = any(c.isdigit() for c in q) and any(kw in q for kw in ["điểm", "a00", "a01", "b00", "d07", "đgnl"])
    has_predict = any(kw in q for kw in _PREDICT_KEYWORDS)
    has_orient = any(kw in q for kw in _ORIENT_KEYWORDS)
    
    if has_score and has_predict:
        logger.info(f"Intent (keyword): 'predict' for: '{question[:80]}'")
        return "predict"
    if has_orient and not has_score:
        logger.info(f"Intent (keyword): 'orient' for: '{question[:80]}'")
        return "orient"
    
    # Nếu không rõ ràng, dùng LLM nhẹ để phân loại
    if has_predict or has_orient:
        try:
            llm = get_fast_llm()
            result = llm.invoke([HumanMessage(content=INTENT_PROMPT.format(question=question))])
            intent = _extract_text_from_response(result).lower().strip().strip('"').strip("'")
            if intent in ("predict", "orient", "general"):
                logger.info(f"Intent (LLM): '{intent}' for: '{question[:80]}'")
                return intent
        except Exception as e:
            logger.error(f"Intent detection error: {e}")
    
    return "general"


def _clean_json_string(text: str) -> str:
    start = text.find('{')
    end = text.rfind('}')
    if start != -1 and end != -1:
        return text[start:end+1]
    return text


def extract_predict_info(question: str) -> dict:
    """Trích xuất thông tin dự đoán từ câu hỏi."""
    try:
        llm = get_fast_llm()
        result = llm.invoke([HumanMessage(content=EXTRACT_PREDICT_PROMPT.format(question=question))])
        text = _extract_text_from_response(result)
        text = _clean_json_string(text)
        return json.loads(text)
    except Exception as e:
        logger.error(f"Extract predict info error: {e}")
        return {"score": 0, "method": "A00", "major": ""}


def extract_orient_info(question: str) -> dict:
    """Trích xuất thông tin định hướng từ câu hỏi."""
    try:
        llm = get_fast_llm()
        result = llm.invoke([HumanMessage(content=EXTRACT_ORIENT_PROMPT.format(question=question))])
        text = _extract_text_from_response(result)
        text = _clean_json_string(text)
        return json.loads(text)
    except Exception as e:
        logger.error(f"Extract orient info error: {e}")
        return {"interests": [], "personality": [], "budget": None, "strengths": []}


def retrieve_context(query: str) -> Tuple[str, List[dict]]:
    """Retrieve relevant context from vector store."""
    try:
        from langchain_google_genai import GoogleGenerativeAIEmbeddings
        dynamic_embeddings = GoogleGenerativeAIEmbeddings(
            model="models/gemini-embedding-2",
            google_api_key=get_random_api_key()
        )
        query_vector = dynamic_embeddings.embed_query(query)
        results = get_vectorstore().similarity_search_with_score_by_vector(query_vector, k=settings.top_k_results)
    except Exception as e:
        logger.error(f"Generate response error: {e}")
        return "Xin lỗi, đã xảy ra lỗi: Hệ thống đang phục vụ quá nhiều yêu cầu cùng lúc nên AI cần nghỉ vài giây. Bạn vui lòng đợi 15 giây rồi gửi lại câu hỏi nhé!. Vui lòng thử lại.", []

    context_parts = []
    sources = []
    seen_sources = set()

    for doc, score in results:
        if score > 2.0:
            continue
        source_label = doc.metadata.get("source", "Tài liệu trường")
        context_parts.append(f"[Nguồn: {source_label}]\n{doc.page_content}")

        source_key = f"{doc.metadata.get('filename', '')}_{doc.metadata.get('page', '')}"
        if source_key not in seen_sources:
            seen_sources.add(source_key)
            sources.append({
                "filename": doc.metadata.get("filename", ""),
                "page": doc.metadata.get("page", 1),
                "source": source_label,
                "category": doc.metadata.get("category", "general"),
            })

    context = "\n\n---\n\n".join(context_parts)
    return context, sources


def reformulate_question(question: str, history: List[dict]) -> str:
    """Reformulate question considering conversation history."""
    # Bỏ qua hoàn toàn khâu gọi LLM viết lại câu hỏi để tiết kiệm 2-3s thời gian chờ
    return question


def generate_response(user_message: str, history: List[dict], lang: str = "vi") -> Tuple[str, List[dict]]:
    """Generate AI response using RAG pipeline with intent detection."""
    
    # Step 1: Detect intent
    intent = detect_intent(user_message)
    
    # Step 2: Route based on intent
    if intent == "predict":
        return _handle_predict(user_message, history, lang)
    elif intent == "orient":
        return _handle_orient(user_message, history, lang)
    else:
        return _handle_general(user_message, history, lang)


def _handle_predict(user_message: str, history: List[dict], lang: str = "vi") -> Tuple[str, List[dict]]:
    """Xử lý câu hỏi dự đoán tỷ lệ đậu."""
    # Extract structured info from question
    info = extract_predict_info(user_message)
    logger.info(f"Predict info extracted: {info}")
    
    # Run prediction
    result = predict_admission(
        score=info.get("score", 0),
        method=info.get("method", "A00"),
        major=info.get("major", ""),
    )
    
    json_block = f"<!--PREDICT_RESULT:{json.dumps(result, ensure_ascii=False)}-->"
    
    llm = get_fast_llm()
    prompt = f"Kết quả dự đoán khả năng đậu ĐH KHTN (HCMUS): {json.dumps(result, ensure_ascii=False)}. Dựa trên kết quả này, hãy đóng vai chuyên viên tư vấn viết một đoạn trả lời tự nhiên, đầy đủ ý nhưng gọn gàng để báo kết quả cho học sinh. LUÔN LUÔN kết thúc câu trả lời bằng lời khuyên học sinh tham khảo thêm thông tin chính thức tại trang web hcmus.edu.vn."
    response = llm.invoke([HumanMessage(content=prompt)])
    summary = _extract_text_from_response(response)
    
    final_text = f"{json_block}\n\n{summary}"
    return final_text, []


def _handle_orient(user_message: str, history: List[dict], lang: str = "vi") -> Tuple[str, List[dict]]:
    """Xử lý câu hỏi định hướng ngành học."""
    # Extract structured info
    info = extract_orient_info(user_message)
    logger.info(f"Orient info extracted: {info}")
    
    # Run career orientation
    result = career_orientation(
        interests=info.get("interests", []),
        personality=info.get("personality", []),
        budget=info.get("budget"),
        strengths=info.get("strengths", []),
    )
    
    json_block = f"<!--ORIENT_RESULT:{json.dumps(result, ensure_ascii=False)}-->"
    
    llm = get_fast_llm()
    prompt = f"Kết quả định hướng nghề nghiệp ĐH KHTN (HCMUS): {json.dumps(result, ensure_ascii=False)}. Hãy đóng vai chuyên viên tư vấn viết một đoạn trả lời thật tự nhiên, đầy đủ ý nhưng gọn gàng để gợi ý các ngành học này cho học sinh. LUÔN LUÔN kết thúc câu trả lời bằng lời khuyên học sinh xem thêm thông tin chi tiết các ngành học tại trang web hcmus.edu.vn."
    response = llm.invoke([HumanMessage(content=prompt)])
    summary = _extract_text_from_response(response)
    
    final_text = f"{json_block}\n\n{summary}"
    return final_text, []


def _handle_general(user_message: str, history: List[dict], lang: str = "vi") -> Tuple[str, List[dict]]:
    """Xử lý câu hỏi thông thường (RAG pipeline gốc)."""
    standalone_query = reformulate_question(user_message, history)
    context, sources = retrieve_context(standalone_query)
    
    llm = get_fast_llm() # OPTIMIZED: dùng fast_llm (temperature=0.1) thay vì llm thường để sinh câu trả lời nhanh hơn
    system_prompt = SYSTEM_PROMPT_EN if lang == "en" else SYSTEM_PROMPT
    messages = [SystemMessage(content=system_prompt)]

    for msg in history[-(settings.max_history_messages):]:
        if msg["role"] == "user":
            messages.append(HumanMessage(content=msg["content"]))
        else:
            messages.append(AIMessage(content=msg["content"]))

    if context:
        if lang == "en":
            current_prompt = f"""Reference information from official HCMUS documents:

{context}

---

User's question: {user_message}

Please answer based on the reference information above. Answer in English. If the information is insufficient, clearly state so and suggest contacting the university."""
        else:
            current_prompt = f"""Thông tin tham khảo từ tài liệu chính thức của trường HCMUS:

{context}

---

Câu hỏi của người dùng: {user_message}

Hãy trả lời dựa trên thông tin tham khảo trên. Nếu thông tin không đủ, hãy nói rõ và gợi ý liên hệ trường."""
    else:
        if lang == "en":
            current_prompt = f"""{user_message}

(Internal note: No relevant information found in the university's document database. Please answer based on general knowledge about the university or suggest contacting them directly. Answer in English.)"""
        else:
            current_prompt = f"""{user_message}

(Lưu ý nội bộ: Không tìm thấy thông tin liên quan trong cơ sở dữ liệu tài liệu của trường. Hãy trả lời dựa trên hiểu biết chung về trường hoặc gợi ý liên hệ trực tiếp.)"""

    messages.append(HumanMessage(content=current_prompt))

    response = llm.invoke(messages)
    final_content = _extract_text_from_response(response)
    
    # Bổ sung nguồn PDF mặc định nếu hỏi về điểm chuẩn
    if any(kw in user_message.lower() for kw in ["điểm", "chuẩn", "đgnl", "thpt"]):
        has_score_source = any("diem_chuan" in s.get("filename", "").lower() for s in sources)
        if not has_score_source:
            sources.append({
                "filename": "diem_chuan_hcmus_2025.pdf",
                "page": 1,
                "source": "Bảng điểm chuẩn Đại học KHTN",
                "category": "score"
            })
            
    return final_content, sources
