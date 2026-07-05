from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
import os

pdfmetrics.registerFont(TTFont('Arial', 'C:\\Windows\\Fonts\\arial.ttf'))
pdfmetrics.registerFont(TTFont('Arial-Bold', 'C:\\Windows\\Fonts\\arialbd.ttf'))

doc = SimpleDocTemplate("hoc_phi_2026.pdf", pagesize=A4)
elements = []

styles = getSampleStyleSheet()
title_style = ParagraphStyle(
    name='Title',
    fontName='Arial-Bold',
    fontSize=14,
    alignment=1, # Center
    spaceAfter=20
)

elements.append(Paragraph("(DỰ KIẾN) HỌC PHÍ KHÓA TUYỂN 2026", title_style))

data = [
    ["STT", "Tên ngành", "2026-2027 (Năm 1)"],
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
    ["30", "Nhóm ngành máy tính và Công nghệ thông tin\n(ngành CNTT; Kỹ thuật phần mềm; HTTT; KH Máy tính)", "40,500,000"],
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
    ["44", "Công nghệ giáo dục", "35,800,000"]
]

table = Table(data, colWidths=[40, 300, 120])
table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#4A70C2')),
    ('TEXTCOLOR', (0,0), (-1,0), colors.white),
    ('ALIGN', (0,0), (0,-1), 'CENTER'),
    ('ALIGN', (2,0), (2,-1), 'CENTER'),
    ('ALIGN', (1,0), (1,-1), 'LEFT'),
    ('ALIGN', (1,0), (1,0), 'CENTER'),
    ('FONTNAME', (0,0), (-1,-1), 'Arial'),
    ('FONTNAME', (0,0), (-1,0), 'Arial-Bold'),
    ('FONTSIZE', (0,0), (-1,-1), 10),
    ('BOTTOMPADDING', (0,0), (-1,0), 8),
    ('BACKGROUND', (0,1), (-1,-1), colors.white),
    ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
]))

elements.append(table)
doc.build(elements)
print("Thành công!")
