import os
import urllib.request
from fpdf import FPDF

# Download font
font_url = "https://raw.githubusercontent.com/google/fonts/main/ofl/roboto/Roboto-Regular.ttf"
font_bold_url = "https://raw.githubusercontent.com/google/fonts/main/ofl/roboto/Roboto-Bold.ttf"

# Check if URL works, if not try apache/roboto
import urllib.error
try:
    if not os.path.exists("Roboto-Regular.ttf"):
        urllib.request.urlretrieve(font_url, "Roboto-Regular.ttf")
    if not os.path.exists("Roboto-Bold.ttf"):
        urllib.request.urlretrieve(font_bold_url, "Roboto-Bold.ttf")
except urllib.error.HTTPError:
    font_url = "https://raw.githubusercontent.com/google/fonts/main/apache/roboto/Roboto-Regular.ttf"
    font_bold_url = "https://raw.githubusercontent.com/google/fonts/main/apache/roboto/Roboto-Bold.ttf"
    if not os.path.exists("Roboto-Regular.ttf"):
        urllib.request.urlretrieve(font_url, "Roboto-Regular.ttf")
    if not os.path.exists("Roboto-Bold.ttf"):
        urllib.request.urlretrieve(font_bold_url, "Roboto-Bold.ttf")


data = [
    ["1", "Sinh học", "38,600,000"],
    ["2", "Sinh học (CT TCTA)", "54,600,000"],
    ["3", "Công nghệ Sinh học", "38,600,000"],
    ["4", "Công nghệ Sinh học (CT TCTA)", "54,600,000"],
    ["5", "Vật lý học", "32,600,000"],
    ["6", "Vật lý học (CT TCTA)", "50,800,000"],
    ["7", "Công nghệ vật lý điện tử và tin học", "38,600,000"],
    ["8", "Công nghệ vật lý điện tử và tin học (CT TCTA) (dự kiến)", "Dự kiến"],
    ["9", "Công nghệ bán dẫn", "38,600,000"],
    ["10", "Hoá học", "38,600,000"],
    ["11", "Hóa học (CT TCTA)", "58,900,000"],
    ["12", "Khoa học Vật liệu", "38,600,000"],
    ["13", "Khoa học Vật liệu (CT TCTA)", "54,600,000"],
    ["14", "Địa chất học", "32,600,000"],
    ["15", "Kinh tế đất đai", "38,600,000"],
    ["16", "Hải dương học", "32,600,000"],
    ["17", "Hải dương học (CT TCTA) (dự kiến)", "Dự kiến"],
    ["18", "Khoa học Môi trường", "32,600,000"],
    ["19", "Khoa học Môi trường (CT TCTA)", "54,600,000"],
    ["20", "Toán học", "40,500,000"],
    ["21", "Toán ứng dụng", "40,500,000"],
    ["22", "Toán ứng dụng (CT TCTA) (dự kiến)", "Dự kiến"],
    ["23", "Toán tin", "40,500,000"],
    ["24", "Toán tin (CT TCTA) (dự kiến)", "Dự kiến"],
    ["25", "Khoa học Dữ liệu", "40,500,000"],
    ["26", "Khoa học dữ liệu (CT TCTA) (dự kiến)", "Dự kiến"],
    ["27", "Thống kê", "40,500,000"],
    ["28", "Khoa học máy tính (CT Tiên tiến)", "70,000,000"],
    ["29", "Công nghệ thông tin (CT TCTA)", "49,500,000"],
    ["30", "Nhóm ngành máy tính và Công nghệ thông tin (ngành Công nghệ thông tin; ngành Kỹ thuật phần mềm; ngành Hệ thống thông tin; ngành Khoa học máy tính)", "40,500,000"],
    ["31", "Trí tuệ nhân tạo", "40,500,000"],
    ["32", "Công nghệ kỹ thuật Hoá học (CT TCTA)", "59,800,000"],
    ["33", "Công nghệ Vật liệu", "40,500,000"],
    ["34", "Công nghệ Vật liệu (CT TCTA) (dự kiến)", "Dự kiến"],
    ["35", "Công nghệ Kỹ thuật Môi trường", "32,600,000"],
    ["36", "Kỹ thuật điện tử - viễn thông", "40,500,000"],
    ["37", "Kỹ thuật điện tử - viễn thông (CT TCTA)", "49,000,000"],
    ["38", "Thiết kế vi mạch", "40,500,000"],
    ["39", "Kỹ thuật hạt nhân", "32,600,000"],
    ["40", "Vật lý Y khoa", "37,000,000"],
    ["41", "Vật lý Y khoa (CT TCTA) (dự kiến)", "Dự kiến"],
    ["42", "Kỹ thuật Địa chất", "32,600,000"],
    ["43", "Quản lý tài nguyên và môi trường", "32,600,000"],
    ["44", "Công nghệ giáo dục", "35,800,000"],
]

pdf = FPDF()
pdf.add_page()
pdf.add_font("Roboto", style="", fname="Roboto-Regular.ttf", uni=True)
pdf.add_font("Roboto", style="B", fname="Roboto-Bold.ttf", uni=True)
pdf.set_font("Roboto", style="B", size=16)

pdf.cell(0, 10, "(DỰ KIẾN) HỌC PHÍ KHÓA TUYỂN 2026", ln=True, align="C")
pdf.ln(5)

pdf.set_font("Roboto", style="B", size=11)
pdf.cell(15, 10, "STT", border=1, align="C")
pdf.cell(125, 10, "Tên ngành", border=1, align="C")
pdf.cell(50, 10, "2026-2027 (Năm 1)", border=1, align="C", ln=True)

pdf.set_font("Roboto", size=11)
for row in data:
    # Use multi_cell for the Tên ngành column because it can be long
    # We need to calculate height first
    
    stt = row[0]
    nganh = row[1]
    hocphi = row[2]
    
    # Simple way: just use multi_cell for the whole row?
    # FPDF2 table is better, but let's do manual row height
    x = pdf.get_x()
    y = pdf.get_y()
    
    pdf.multi_cell(125, 8, nganh, border=1, align="L")
    new_y = pdf.get_y()
    h = new_y - y
    
    # Draw STT and Học phí
    pdf.set_xy(x, y)
    pdf.cell(15, h, stt, border=1, align="C")
    
    pdf.set_xy(x + 15 + 125, y)
    pdf.cell(50, h, hocphi, border=1, align="C")
    
    pdf.set_y(new_y)

pdf.output("hoc_phi_2026.pdf")
print("Tạo file PDF thành công!")
