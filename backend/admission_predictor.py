"""
Module Dự đoán Tuyển sinh & Định hướng Ngành học
Trường Đại học Khoa học Tự nhiên - ĐHQG HCM (HCMUS)
"""

import logging
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

# =====================================================
# DỮ LIỆU ĐIỂM CHUẨN 2025 (trích từ PDF đã nạp)
# Cấu trúc: { "tên_ngành": { "khối_thi": điểm_chuẩn } }
# =====================================================

DIEM_CHUAN_THPT_2025 = {
    "Thiết kế vi mạch": {"A00": 28.25, "A01": 28.25, "D07": 27.55},
    "Khoa học máy tính (CT Tiên tiến)": {"A00": 29.92, "A01": 29.81, "B00": 29.81, "D07": 29.56},
    "Trí tuệ nhân tạo": {"A00": 29.39, "A01": 29.10, "B00": 29.10, "D07": 28.85},
    "Công nghệ thông tin (CT TCTA)": {"A00": 25.87, "A01": 24.62, "B00": 24.99, "D07": 24.37},
    "Nhóm ngành máy tính và CNTT": {"A00": 27.27, "A01": 26.27, "B00": 26.66, "D07": 26.16},
    "Nhóm ngành Khoa học dữ liệu, Thống kê": {"A00": 28.50, "A01": 27.92, "B00": 27.92, "D01": 27.17, "D07": 27.67},
    "Nhóm ngành Toán học, Toán ứng dụng, Toán tin": {"A00": 26.75, "A01": 26.00, "D07": 25.75},
    "Công nghệ giáo dục": {"A00": 24.00, "A01": 23.50, "D07": 23.00},
    "Kỹ thuật điện tử - viễn thông": {"A00": 25.50, "A01": 25.00, "D07": 24.50},
    "Kỹ thuật điện tử - viễn thông (CT TCTA)": {"A00": 24.00, "A01": 23.50, "D07": 23.00},
    "Nhóm ngành Vật lý học, CN bán dẫn": {"A00": 26.50, "A01": 26.00, "B00": 25.50, "D07": 25.50},
    "Vật lý học (CT TCTA)": {"A00": 24.00, "A01": 23.50, "D07": 23.00},
    "Khoa học Vật liệu": {"A00": 24.50, "A01": 24.00, "B00": 24.00, "D07": 23.50},
    "Khoa học Vật liệu (CT TCTA)": {"A00": 22.00, "A01": 21.50, "D07": 21.00},
    "Công nghệ Vật liệu": {"A00": 23.00, "A01": 22.50, "B00": 22.50, "D07": 22.00},
    "Kỹ thuật hạt nhân": {"A00": 24.50, "A01": 24.00, "D07": 23.50},
    "Vật lý y khoa": {"A00": 26.00, "A01": 25.50, "B00": 25.50, "D07": 25.00},
    "Hóa học": {"A00": 24.50, "A01": 24.00, "B00": 24.50, "D07": 23.50},
    "Hóa học (CT TCTA)": {"A00": 22.00, "A01": 21.50, "D07": 21.00},
    "Công nghệ kỹ thuật Hóa học (CT TCTA)": {"A00": 23.00, "A01": 22.50, "D07": 22.00},
    "Sinh học": {"A00": 24.00, "B00": 24.50, "D07": 23.50},
    "Sinh học (CT TCTA)": {"A00": 22.00, "B00": 22.50, "D07": 21.50},
    "Công nghệ Sinh học": {"A00": 25.50, "B00": 26.00, "D07": 25.00},
    "Công nghệ Sinh học (CT TCTA)": {"A00": 23.00, "B00": 23.50, "D07": 22.50},
    "Khoa học Môi trường": {"A00": 23.00, "A01": 22.50, "B00": 23.00, "D07": 22.00},
    "Khoa học Môi trường (CT TCTA)": {"A00": 21.00, "A01": 20.50, "D07": 20.00},
    "Công nghệ kỹ thuật Môi trường": {"A00": 22.00, "A01": 21.50, "B00": 22.00, "D07": 21.00},
    "Quản lý tài nguyên và môi trường": {"A00": 21.00, "A01": 20.50, "B00": 21.00, "D07": 20.00},
    "Kỹ thuật địa chất": {"A00": 22.00, "A01": 21.50, "D07": 21.00},
    "Nhóm ngành Địa chất học, Kinh tế đất đai": {"A00": 22.00, "A01": 21.50, "D07": 21.00},
    "Hải dương học": {"A00": 21.50, "A01": 21.00, "B00": 21.50, "D07": 20.50},
}

DIEM_CHUAN_DGNL_2025 = {
    "Khoa học máy tính (CT Tiên tiến)": 1136,
    "Trí tuệ nhân tạo": 1092,
    "Nhóm ngành Khoa học dữ liệu, Thống kê": 1019,
    "Nhóm ngành máy tính và CNTT": 972,
    "Công nghệ thông tin (CT TCTA)": 906,
    "Thiết kế vi mạch": 1050,
}

# =====================================================
# THÔNG TIN NGÀNH HỌC (cho chức năng Định hướng)
# =====================================================

NGANH_HOC_INFO = {
    "Khoa học máy tính (CT Tiên tiến)": {
        "linh_vuc": "CNTT",
        "tu_khoa": ["lập trình", "thuật toán", "phần mềm", "máy tính", "code", "AI", "trí tuệ nhân tạo"],
        "tinh_cach": ["logic", "kiên nhẫn", "tỉ mỉ", "sáng tạo", "hướng nội"],
        "hoc_phi_nam": 50,  # triệu/năm (ước tính)
        "do_kho": "Rất cao",
        "co_hoi_viec_lam": "Rất cao",
        "mo_ta": "Đào tạo chuyên sâu về khoa học máy tính, giảng dạy bằng tiếng Anh, cơ hội nghiên cứu quốc tế."
    },
    "Trí tuệ nhân tạo": {
        "linh_vuc": "CNTT",
        "tu_khoa": ["AI", "machine learning", "deep learning", "robot", "thông minh", "dữ liệu", "lập trình"],
        "tinh_cach": ["logic", "sáng tạo", "ham học hỏi", "kiên nhẫn", "hướng nội"],
        "hoc_phi_nam": 45,
        "do_kho": "Rất cao",
        "co_hoi_viec_lam": "Rất cao",
        "mo_ta": "Ngành hot nhất hiện nay, tập trung vào Machine Learning, Deep Learning, Computer Vision."
    },
    "Nhóm ngành máy tính và CNTT": {
        "linh_vuc": "CNTT",
        "tu_khoa": ["lập trình", "web", "app", "phần mềm", "máy tính", "code", "hệ thống"],
        "tinh_cach": ["logic", "kiên nhẫn", "teamwork", "sáng tạo"],
        "hoc_phi_nam": 28,
        "do_kho": "Cao",
        "co_hoi_viec_lam": "Rất cao",
        "mo_ta": "Chương trình đại trà, học phí hợp lý, đào tạo toàn diện về CNTT."
    },
    "Công nghệ thông tin (CT TCTA)": {
        "linh_vuc": "CNTT",
        "tu_khoa": ["lập trình", "web", "app", "phần mềm", "máy tính", "code"],
        "tinh_cach": ["logic", "kiên nhẫn", "teamwork"],
        "hoc_phi_nam": 45,
        "do_kho": "Cao",
        "co_hoi_viec_lam": "Rất cao",
        "mo_ta": "Chương trình Tiên tiến Chất lượng cao, giảng dạy bằng tiếng Anh một phần."
    },
    "Nhóm ngành Khoa học dữ liệu, Thống kê": {
        "linh_vuc": "CNTT",
        "tu_khoa": ["dữ liệu", "thống kê", "phân tích", "data", "số liệu", "machine learning"],
        "tinh_cach": ["logic", "tỉ mỉ", "kiên nhẫn", "phân tích"],
        "hoc_phi_nam": 28,
        "do_kho": "Cao",
        "co_hoi_viec_lam": "Rất cao",
        "mo_ta": "Kết hợp Toán - Thống kê - CNTT, rất được săn đón trong kỷ nguyên Big Data."
    },
    "Thiết kế vi mạch": {
        "linh_vuc": "CNTT",
        "tu_khoa": ["chip", "vi mạch", "bán dẫn", "phần cứng", "điện tử", "VLSI"],
        "tinh_cach": ["tỉ mỉ", "logic", "kiên nhẫn", "nghiên cứu"],
        "hoc_phi_nam": 35,
        "do_kho": "Rất cao",
        "co_hoi_viec_lam": "Rất cao",
        "mo_ta": "Ngành chiến lược quốc gia, nhu cầu nhân lực cực lớn trong lĩnh vực bán dẫn."
    },
    "Nhóm ngành Toán học, Toán ứng dụng, Toán tin": {
        "linh_vuc": "Toán",
        "tu_khoa": ["toán", "tính toán", "logic", "thuật toán", "mô hình", "phân tích"],
        "tinh_cach": ["logic", "kiên nhẫn", "tư duy trừu tượng", "nghiên cứu"],
        "hoc_phi_nam": 22,
        "do_kho": "Cao",
        "co_hoi_viec_lam": "Cao",
        "mo_ta": "Nền tảng vững chắc cho nghiên cứu, tài chính, và CNTT."
    },
    "Công nghệ giáo dục": {
        "linh_vuc": "CNTT",
        "tu_khoa": ["giáo dục", "dạy học", "công nghệ", "e-learning", "sư phạm"],
        "tinh_cach": ["hướng ngoại", "kiên nhẫn", "giao tiếp", "sáng tạo"],
        "hoc_phi_nam": 22,
        "do_kho": "Trung bình",
        "co_hoi_viec_lam": "Cao",
        "mo_ta": "Kết hợp CNTT và giáo dục, phù hợp với ai muốn làm giáo viên CNTT."
    },
    "Nhóm ngành Vật lý học, CN bán dẫn": {
        "linh_vuc": "Vật lý",
        "tu_khoa": ["vật lý", "bán dẫn", "điện tử", "quang học", "nghiên cứu", "thí nghiệm"],
        "tinh_cach": ["tò mò", "logic", "nghiên cứu", "kiên nhẫn"],
        "hoc_phi_nam": 22,
        "do_kho": "Cao",
        "co_hoi_viec_lam": "Cao",
        "mo_ta": "Ngành bán dẫn đang bùng nổ, có nhiều cơ hội việc làm tại các tập đoàn lớn như Intel, Samsung."
    },
    "Kỹ thuật điện tử - viễn thông": {
        "linh_vuc": "Điện tử",
        "tu_khoa": ["điện tử", "viễn thông", "mạng", "IoT", "tín hiệu", "phần cứng"],
        "tinh_cach": ["logic", "tỉ mỉ", "thực hành", "kiên nhẫn"],
        "hoc_phi_nam": 25,
        "do_kho": "Cao",
        "co_hoi_viec_lam": "Cao",
        "mo_ta": "Kỹ thuật viễn thông, IoT, mạng 5G - ngành không bao giờ lỗi thời."
    },
    "Vật lý y khoa": {
        "linh_vuc": "Vật lý",
        "tu_khoa": ["y khoa", "vật lý", "bệnh viện", "chẩn đoán", "xạ trị", "thiết bị y tế"],
        "tinh_cach": ["tỉ mỉ", "trách nhiệm", "kiên nhẫn", "nghiên cứu"],
        "hoc_phi_nam": 25,
        "do_kho": "Cao",
        "co_hoi_viec_lam": "Cao",
        "mo_ta": "Ứng dụng vật lý trong y học, làm việc tại bệnh viện với thiết bị chẩn đoán hiện đại."
    },
    "Công nghệ Sinh học": {
        "linh_vuc": "Sinh học",
        "tu_khoa": ["sinh học", "gen", "DNA", "thực phẩm", "dược", "nông nghiệp", "thí nghiệm"],
        "tinh_cach": ["tỉ mỉ", "kiên nhẫn", "nghiên cứu", "tò mò"],
        "hoc_phi_nam": 25,
        "do_kho": "Cao",
        "co_hoi_viec_lam": "Cao",
        "mo_ta": "Công nghệ sinh học ứng dụng trong dược phẩm, thực phẩm, nông nghiệp."
    },
    "Hóa học": {
        "linh_vuc": "Hóa học",
        "tu_khoa": ["hóa học", "phản ứng", "thí nghiệm", "phân tích", "hóa chất"],
        "tinh_cach": ["tỉ mỉ", "cẩn thận", "nghiên cứu", "kiên nhẫn"],
        "hoc_phi_nam": 22,
        "do_kho": "Cao",
        "co_hoi_viec_lam": "Trung bình - Cao",
        "mo_ta": "Hóa học cơ bản và ứng dụng, phù hợp cho nghiên cứu và công nghiệp."
    },
    "Khoa học Môi trường": {
        "linh_vuc": "Môi trường",
        "tu_khoa": ["môi trường", "xanh", "ô nhiễm", "bảo vệ", "tự nhiên", "sinh thái"],
        "tinh_cach": ["yêu thiên nhiên", "trách nhiệm", "nghiên cứu"],
        "hoc_phi_nam": 22,
        "do_kho": "Trung bình",
        "co_hoi_viec_lam": "Trung bình - Cao",
        "mo_ta": "Bảo vệ môi trường, xử lý ô nhiễm, phát triển bền vững."
    },
    "Hải dương học": {
        "linh_vuc": "Địa chất",
        "tu_khoa": ["biển", "đại dương", "hải dương", "nghiên cứu biển", "thủy sản"],
        "tinh_cach": ["yêu thiên nhiên", "phiêu lưu", "nghiên cứu", "kiên nhẫn"],
        "hoc_phi_nam": 20,
        "do_kho": "Trung bình",
        "co_hoi_viec_lam": "Trung bình",
        "mo_ta": "Nghiên cứu biển và đại dương, ngành hiếm nhưng có giá trị khoa học lớn."
    },
}


# =====================================================
# HÀM DỰ ĐOÁN TỶ LỆ ĐẬU
# =====================================================

def predict_admission(score: float, method: str, major: str) -> Dict:
    """
    Dự đoán tỷ lệ đậu dựa trên điểm, khối thi và ngành.
    
    Args:
        score: Điểm dự kiến của thí sinh
        method: Khối thi (A00, A01, B00, D07...) hoặc "DGNL"
        major: Tên ngành muốn xét
        
    Returns:
        Dict chứa kết quả phân tích
    """
    result = {
        "type": "admission_prediction",
        "input": {"score": score, "method": method, "major": major},
        "found": False,
        "benchmark_score": None,
        "difference": None,
        "probability": None,
        "level": None,
        "analysis": "",
        "alternatives": [],
    }
    
    # Tìm ngành gần nhất trong CSDL (fuzzy matching đơn giản)
    matched_major = _find_major(major)
    if not matched_major:
        result["analysis"] = f"Không tìm thấy ngành '{major}' trong cơ sở dữ liệu điểm chuẩn."
        return result
    
    result["major_matched"] = matched_major
    
    # Xét theo phương thức
    if method.upper() == "DGNL":
        if matched_major in DIEM_CHUAN_DGNL_2025:
            benchmark = DIEM_CHUAN_DGNL_2025[matched_major]
            result["found"] = True
            result["benchmark_score"] = benchmark
            diff = score - benchmark
            result["difference"] = round(diff, 2)
            result["probability"], result["level"] = _calc_probability_dgnl(diff)
        else:
            result["analysis"] = f"Ngành '{matched_major}' chưa có dữ liệu xét theo ĐGNL."
            return result
    else:
        method_upper = method.upper()
        if matched_major in DIEM_CHUAN_THPT_2025:
            scores = DIEM_CHUAN_THPT_2025[matched_major]
            if method_upper in scores:
                benchmark = scores[method_upper]
                result["found"] = True
                result["benchmark_score"] = benchmark
                diff = score - benchmark
                result["difference"] = round(diff, 2)
                result["probability"], result["level"] = _calc_probability_thpt(diff)
            else:
                available = ", ".join(scores.keys())
                result["analysis"] = f"Ngành '{matched_major}' không xét khối {method_upper}. Các khối xét: {available}."
                return result
        else:
            result["analysis"] = f"Không tìm thấy dữ liệu điểm chuẩn THPT cho ngành '{matched_major}'."
            return result
    
    # Phân tích chi tiết
    if result["found"]:
        result["analysis"] = _generate_analysis(
            score, result["benchmark_score"], result["probability"], 
            result["level"], matched_major, method
        )
        # Gợi ý ngành thay thế nếu tỷ lệ đậu thấp
        if result["probability"] < 70:
            result["alternatives"] = _suggest_alternatives(score, method)
    
    return result


def _find_major(query: str) -> Optional[str]:
    """Tìm ngành gần đúng nhất dựa trên tên."""
    query_lower = query.lower().strip()
    if not query_lower:
        return None
    
    # Exact match first
    for name in DIEM_CHUAN_THPT_2025:
        if query_lower == name.lower():
            return name
    
    # Partial match
    best_match = None
    best_score = 0
    for name in DIEM_CHUAN_THPT_2025:
        name_lower = name.lower()
        # Đếm số từ trùng khớp
        query_words = set(query_lower.split())
        name_words = set(name_lower.split())
        common = len(query_words & name_words)
        if common > best_score:
            best_score = common
            best_match = name
        # Kiểm tra chuỗi con
        if query_lower in name_lower or name_lower in query_lower:
            return name
    
    return best_match if best_score >= 1 else None


def _calc_probability_thpt(diff: float) -> tuple:
    """Tính tỷ lệ đậu cho phương thức THPT dựa trên độ lệch điểm."""
    if diff >= 2.0:
        return 98, "Rất cao"
    elif diff >= 1.0:
        return 90, "Cao"
    elif diff >= 0.5:
        return 80, "Khá cao"
    elif diff >= 0:
        return 65, "Trung bình"
    elif diff >= -0.5:
        return 45, "Trung bình - Thấp"
    elif diff >= -1.0:
        return 30, "Thấp"
    elif diff >= -2.0:
        return 15, "Rất thấp"
    else:
        return 5, "Gần như không"


def _calc_probability_dgnl(diff: float) -> tuple:
    """Tính tỷ lệ đậu cho phương thức ĐGNL."""
    if diff >= 100:
        return 98, "Rất cao"
    elif diff >= 50:
        return 90, "Cao"
    elif diff >= 20:
        return 75, "Khá cao"
    elif diff >= 0:
        return 60, "Trung bình"
    elif diff >= -30:
        return 40, "Trung bình - Thấp"
    elif diff >= -80:
        return 20, "Thấp"
    else:
        return 5, "Rất thấp"


def _generate_analysis(score, benchmark, prob, level, major, method):
    """Tạo phân tích chi tiết."""
    diff = score - benchmark
    if diff >= 0:
        return (
            f"Điểm dự kiến của bạn ({score}) cao hơn điểm chuẩn năm 2025 "
            f"({benchmark}) là {abs(diff):.2f} điểm. "
            f"Tỷ lệ đậu ước tính: {prob}% ({level}). "
            f"Bạn đang ở vị thế khá tốt để đậu ngành {major}!"
        )
    else:
        return (
            f"Điểm dự kiến của bạn ({score}) thấp hơn điểm chuẩn năm 2025 "
            f"({benchmark}) là {abs(diff):.2f} điểm. "
            f"Tỷ lệ đậu ước tính: {prob}% ({level}). "
            f"Bạn nên cân nhắc các ngành thay thế bên dưới hoặc cố gắng tăng điểm thêm."
        )


def _suggest_alternatives(score: float, method: str) -> List[Dict]:
    """Gợi ý các ngành thay thế phù hợp với mức điểm."""
    method_upper = method.upper()
    alternatives = []
    
    if method_upper == "DGNL":
        for name, benchmark in DIEM_CHUAN_DGNL_2025.items():
            diff = score - benchmark
            if diff >= -10:  # Trong tầm với
                prob, level = _calc_probability_dgnl(diff)
                alternatives.append({
                    "major": name,
                    "benchmark": benchmark,
                    "probability": prob,
                    "level": level,
                })
    else:
        for name, scores in DIEM_CHUAN_THPT_2025.items():
            if method_upper in scores:
                benchmark = scores[method_upper]
                diff = score - benchmark
                if diff >= -0.5:  # Trong tầm với
                    prob, level = _calc_probability_thpt(diff)
                    alternatives.append({
                        "major": name,
                        "benchmark": benchmark,
                        "probability": prob,
                        "level": level,
                    })
    
    # Sắp xếp theo tỷ lệ đậu giảm dần, lấy tối đa 5 ngành
    alternatives.sort(key=lambda x: x["probability"], reverse=True)
    return alternatives[:5]


# =====================================================
# HÀM ĐỊNH HƯỚNG NGÀNH HỌC
# =====================================================

def career_orientation(
    interests: List[str],
    personality: List[str],
    budget: Optional[float] = None,
    strengths: List[str] = None
) -> Dict:
    """
    Gợi ý Top 3 ngành phù hợp dựa trên sở thích, tính cách, tài chính và thế mạnh.
    
    Args:
        interests: Danh sách sở thích/từ khóa (VD: ["lập trình", "AI"])
        personality: Danh sách tính cách (VD: ["hướng nội", "kiên nhẫn"])
        budget: Học phí tối đa (triệu/năm), None = không giới hạn
        strengths: Các môn giỏi (VD: ["Toán", "Lý"])
        
    Returns:
        Dict chứa Top 3 gợi ý
    """
    if strengths is None:
        strengths = []
    
    scored_majors = []
    
    for name, info in NGANH_HOC_INFO.items():
        score = 0
        reasons = []
        
        # 1. Match sở thích với từ khóa ngành (trọng số cao nhất)
        interest_matches = []
        for interest in interests:
            interest_lower = interest.lower()
            for keyword in info["tu_khoa"]:
                if interest_lower in keyword or keyword in interest_lower:
                    interest_matches.append(keyword)
                    score += 3
                    break
        if interest_matches:
            reasons.append(f"Phù hợp sở thích: {', '.join(set(interest_matches))}")
        
        # 2. Match tính cách
        personality_matches = []
        for trait in personality:
            trait_lower = trait.lower()
            for p in info["tinh_cach"]:
                if trait_lower in p or p in trait_lower:
                    personality_matches.append(p)
                    score += 2
                    break
        if personality_matches:
            reasons.append(f"Hợp tính cách: {', '.join(set(personality_matches))}")
        
        # 3. Kiểm tra ngân sách
        if budget is not None:
            if info["hoc_phi_nam"] <= budget:
                score += 2
                reasons.append(f"Học phí ~{info['hoc_phi_nam']} triệu/năm, trong ngân sách")
            else:
                score -= 3
                reasons.append(f"⚠️ Học phí ~{info['hoc_phi_nam']} triệu/năm, vượt ngân sách")
        
        # 4. Match thế mạnh môn học
        strength_map = {
            "toán": ["CNTT", "Toán", "Điện tử"],
            "lý": ["Vật lý", "Điện tử", "CNTT"],
            "hóa": ["Hóa học", "Môi trường"],
            "sinh": ["Sinh học", "Môi trường"],
            "anh": ["CNTT"],  # Các CT Tiên tiến/CLC
            "tin": ["CNTT", "Toán"],
        }
        for subj in strengths:
            subj_lower = subj.lower()
            for key, fields in strength_map.items():
                if key in subj_lower and info["linh_vuc"] in fields:
                    score += 2
                    reasons.append(f"Giỏi {subj} hỗ trợ tốt cho ngành này")
                    break
        
        if score > 0:
            scored_majors.append({
                "major": name,
                "score": score,
                "reasons": reasons,
                "info": {
                    "hoc_phi": f"~{info['hoc_phi_nam']} triệu/năm",
                    "do_kho": info["do_kho"],
                    "co_hoi_viec_lam": info["co_hoi_viec_lam"],
                    "mo_ta": info["mo_ta"],
                },
            })
    
    # Sắp xếp và lấy Top 3
    scored_majors.sort(key=lambda x: x["score"], reverse=True)
    top3 = scored_majors[:3]
    
    # Gán badge
    badges = ["🥇 Rất phù hợp", "🥈 Phù hợp", "🥉 Có thể cân nhắc"]
    for i, item in enumerate(top3):
        item["badge"] = badges[i] if i < len(badges) else "Có thể cân nhắc"
        # Xóa score nội bộ
        del item["score"]
    
    return {
        "type": "career_orientation",
        "input": {
            "interests": interests,
            "personality": personality,
            "budget": budget,
            "strengths": strengths,
        },
        "recommendations": top3,
        "total_matched": len(scored_majors),
    }
