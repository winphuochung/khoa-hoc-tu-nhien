import sys
import shutil
import os
import docx
from docx.shared import Mm
from docx.enum.section import WD_ORIENT

sys.stdout.reconfigure(encoding='utf-8')

file_path = 'Ma Tran Ban Dac Ta De_Dap_An_KTGK1_KHTN9_2026-2027.docx'
chuan_file_path = 'Ma_Tran_Ban_Dac_Ta_De_Dap_An_KTGK1_KHTN9_2026-2027_Chuan.docx'

# Read by copying to temp first to avoid sharing violations if Word is open
temp_path = 'temp_read.docx'
shutil.copyfile(file_path, temp_path)
doc = docx.Document(temp_path)

if os.path.exists(temp_path):
    os.remove(temp_path)

print(f"Đang xử lý file Word...")

# Định dạng khổ giấy:
# Section 0: Khung Ma trận & Bản đặc tả -> A4 NẰM NGANG
sec0 = doc.sections[0]
sec0.orientation = WD_ORIENT.LANDSCAPE
sec0.page_width = Mm(297)
sec0.page_height = Mm(210)
sec0.top_margin = Mm(12)
sec0.bottom_margin = Mm(12)
sec0.left_margin = Mm(15)
sec0.right_margin = Mm(15)

# Section 1: Đề 01, Đề 02, Đáp án & Hướng dẫn chấm -> A4 THẲNG ĐỨNG
if len(doc.sections) > 1:
    sec1 = doc.sections[1]
    sec1.orientation = WD_ORIENT.PORTRAIT
    sec1.page_width = Mm(210)
    sec1.page_height = Mm(297)
    sec1.top_margin = Mm(15)
    sec1.bottom_margin = Mm(15)
    sec1.left_margin = Mm(20)
    sec1.right_margin = Mm(20)

# Lưu vào file mới chuẩn (không bị Word lock)
doc.save(chuan_file_path)
print(f"-> Đã lưu file chuẩn tại: {chuan_file_path}")

# Đồng bộ sang public và dist để web app tải về
os.makedirs('public', exist_ok=True)
os.makedirs('dist', exist_ok=True)
shutil.copyfile(chuan_file_path, 'public/Ma_Tran_Ban_Dac_Ta_De_Dap_An_KTGK1_KHTN9_2026-2027.docx')
shutil.copyfile(chuan_file_path, 'dist/Ma_Tran_Ban_Dac_Ta_De_Dap_An_KTGK1_KHTN9_2026-2027.docx')
print("-> Đã đồng bộ sang public/ và dist/")

# Cố gắng lưu đè vào file gốc nếu Word không khóa
try:
    doc.save(file_path)
    print(f"-> Đã cập nhật trực tiếp file gốc: {file_path}")
except PermissionError:
    print(f"[LƯU Ý] File '{file_path}' đang được mở trong phần mềm Microsoft Word.")
    print(f"Bạn vui lòng đóng cửa sổ Word đang mở file đó lại, file chuẩn mới nhất đã được lưu tại:")
    print(f"  -> '{chuan_file_path}'")
