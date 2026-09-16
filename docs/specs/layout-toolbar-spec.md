# MAIN TOOLBAR & EXTENDED SECTION LAYOUT ARCHITECTURE SPECIFICATION

Tài liệu này quy định **Kiến trúc Layout Thanh công cụ Kép (Dual-Row Toolbar Architecture)** cho ứng dụng `teaching-app`. Hệ thống thanh công cụ được chia làm 2 tầng rõ ràng: **Thanh công cụ chính (Pinned Main Toolbar)** cố định 100% thời gian và **Thanh công cụ mở rộng (Contextual Extended Toolbar)** hiển thị động theo đúng công cụ hoặc đối tượng đang được chọn.

---

## 1. DUAL-ROW LAYOUT OVERVIEW (TỔNG QUAN KIẾN TRÚC 2 TẦNG)

1. **ROW 1: PINNED MAIN TOOLBAR (Thanh công cụ chính - Cố định 100% thời gian)**
   - Thường trực ở vị trí trên cùng màn hình (`top-0`, `z-30`/`z-40`).
   - Chứa các thành phần thương hiệu, chuyển đổi chế độ (Slide Chiếu / Bảng Trắng), bộ công cụ vẽ chính (Con trỏ, Bút vẽ, Tẩy, Khung chữ, Shape) và các nút thao tác toàn cục (Undo, Redo, Xóa trang, Hẹn giờ, Gọi học sinh, Export).

2. **ROW 2: CONTEXTUAL EXTENDED TOOLBAR (Thanh mở rộng Extend - Hiện động theo ngữ cảnh chọn)**
   - Tự động mở rộng mượt mà dưới Hàng 1 theo **2 Phương thức kích hoạt song song**:
     - **Method 1 (Entity Selection Trigger):** Khi click chọn đối tượng trên Canvas (VD: chọn Khung chữ/Hình khối). Cho phép chỉnh sửa trực tiếp thuộc tính đối tượng đó.
     - **Method 2 (Tool Selection Trigger):** Khi click chọn công cụ trên Hàng 1 (VD: chọn Khung chữ T / Hình khối S). Cho phép cấu hình các thuộc tính mặc định trước khi vẽ/tạo mới đối tượng.
   - **Quy tắc Bỏ chọn khi Chuyển công cụ (Unselect Entity on Tool Switch):** Khi đang có một đối tượng được chọn trên màn hình (`selectedAnnotation !== null`), nếu click chọn bất kỳ công cụ nào khác trên Hàng 1 hoặc dùng phím tắt (B, T, R, C, E, V, Escape), hệ thống tự động bỏ chọn đối tượng đó (`selectedAnnotation = null`).
   - **Quy tắc Tự động Highlight Công cụ khi Select Entity (Auto Tool Active Highlight):** Khi người dùng click chọn 1 đối tượng trên Canvas (Khung chữ/Hình khối/Bút vẽ), hệ thống tự động đồng bộ công cụ trên Hàng 1 và highlight sáng xanh nút bấm tương ứng (Khung chữ `T` hoặc Hình khối `S`).
   - **Quy tắc Chuyển đổi công cụ sau khi Thao tác (Tool Switch Behavior After Usage):**
     - **Bút vẽ (`pencil`) & Tẩy xóa (`eraser`) - Continuous Mode:** Bút vẽ và Tẩy xóa giữ nguyên công cụ sau khi vẽ/xóa, KHÔNG tự động chuyển về Con trỏ (V) để vẽ/xóa liên tục.
     - **Thẻ chữ (`text`) & Hình khối (`shape`):** Sau khi kéo vẽ tạo xong, hệ thống tự động chọn đối tượng vừa tạo và tự động chuyển về **`Con trỏ (V)`**, hỗ trợ kéo di chuyển và co giãn kích thước (8-Handle Resizing) ngay lập tức.
   - **Tự động ẩn:** Khi click ra vùng trống Canvas (Deselect), thanh Extend tự động đóng lại để tối ưu không gian hiển thị bài học.

---

## 2. BẢNG ÁNH XẠ NGỮ CẢNH HÀNG 2 (SECTION EXTEND MATRIX)

| Ngữ cảnh (Context Trigger) | Kích hoạt (Trigger Method) | Component Mở rộng | Danh sách Công cụ Hiển thị trên Thanh Extend |
| :--- | :--- | :--- | :--- |
| **Đang chọn Khung chữ** | Method 1 (`selectedAnnotation.type === 'text'`) | `TextBoxContextualSection.tsx` | - Badge `📌 Khung Chữ (Đang chọn)`<br>- Custom Font Select (`CustomDropdownSelect`)<br>- Font Size Stepper & Select<br>- Bold, Italic, Underline, Strikethrough<br>- Alignments (Trái, Giữa, Phải, Đều)<br>- `ColorSwatchPicker` Màu chữ<br>- `ColorSwatchPicker` Màu nền (kèm reset `Ø`)<br>- `ColorSwatchPicker` Màu viền (kèm reset `Ø`)<br>- Custom Border Style & Width Select<br>- `Auto-fit` vs `Fixed bounds` mode<br>- Duplicate (`Ctrl+D`) & Delete |
| **Đang chọn Tool Khung chữ (T)** | Method 2 (`activeTool === 'text' & !selectedAnnotation`) | `TextBoxContextualSection.tsx` | - Badge `📌 Cấu hình Khung Chữ`<br>- Cấu hình thiết lập mặc định trước khi vẽ (Font, Cỡ chữ, Màu chữ, Màu nền, Màu viền, Căn lề...)<br>- (Nút Xóa / Duplicate ẩn) |
| **Đang chọn Nét Bút vẽ** | Method 1 (`selectedAnnotation.type === 'pencil'`) | `PencilContextualSection.tsx` | - Badge `📌 Nét Bút Vẽ (Đang chọn)`<br>- `ColorSwatchPicker` Màu nét vẽ<br>- Stepper & Dropdown Cỡ nét (`1px` - `24px`)<br>- Nút Xóa nét vẽ |
| **Đang chọn Tool Bút vẽ (B)** | Method 2 (`activeTool === 'pencil' & !selectedAnnotation`) | `PencilContextualSection.tsx` | - Badge `📌 Cấu hình Bút Vẽ`<br>- `ColorSwatchPicker` Màu nét mặc định<br>- Stepper & Dropdown Cỡ nét mặc định (`1px` - `24px`) |
| **Đang chọn Hình khối** | Method 1 (`isShapeSelected`) | `ShapeContextualSection.tsx` | - Badge `📌 Hình Khối (Đang chọn)`<br>- Dropdown đổi loại hình khối (Chữ nhật, Tròn, Mũi tên, Đường thẳng)<br>- `ColorSwatchPicker` Màu tô (Fill Color)<br>- `ColorSwatchPicker` Màu viền/nét (Stroke Color)<br>- Dropdown Kiểu viền & Độ dày viền<br>- Duplicate (`Ctrl+D`) & Delete |
| **Đang chọn Tool Hình khối (S)** | Method 2 (`isShapeToolActive & !selectedAnnotation`) | `ShapeContextualSection.tsx` | - Badge `📌 Cấu hình Hình Khối`<br>- Chọn loại hình khối mặc định (Chữ nhật, Tròn, Mũi tên, Đường thẳng)<br>- Thiết lập màu tô, màu viền, kiểu viền, độ dày viền mặc định trước khi vẽ<br>- (Nút Xóa / Duplicate ẩn) |
| **Chọn Bảng (`type === 'table'` - Tương lai)** | Method 1 | `TableContextualSection` | - Thêm/Xóa Hàng & Cột, Trộn/Tách ô<br>- `ColorSwatchPicker` Màu nền ô & Màu lưới |
| **Chọn Hình ảnh (`type === 'image'` - Tương lai)** | Method 1 | `ImageContextualSection` | - Cắt ảnh (Crop), Bo góc (Radius), Xoay (Rotate)<br>- `ColorSwatchPicker` Màu viền |

---

## 3. QUY ĐỊNH CHUẨN GIAO DIỆN & TÁI SỬ DỤNG COMPONENT

1. **Chiều cao & Khoảng cách (Spacing Standard):**
   - Hàng 1: Chiều cao `h-14` / `h-16`, padding `px-4 py-2`.
   - Hàng 2: Chiều cao `py-1.5 px-4`, `gap-2`.
   - Nút bấm Hàng Extend có chiều cao chuẩn `h-7`, bo góc `rounded-lg`, font-size `text-xs`.

2. **Component Tái sử dụng Bắt buộc:**
   - **Màu sắc:** Bắt buộc dùng `ColorSwatchPicker` (`src/features/ppt-text-box/components/ColorSwatchPicker.tsx`).
   - **Dropdown:** Bắt buộc dùng `CustomDropdownSelect` (`src/features/ppt-text-box/components/CustomDropdownSelect.tsx`).
