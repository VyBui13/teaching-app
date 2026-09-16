---
name: layout-toolbar-spec
description: Architecture specification and implementation blueprint for the main pinned top toolbar and contextual extended toolbar (Section Extend) system in teaching-app.
---

# MAIN TOOLBAR & EXTENDED SECTION LAYOUT ARCHITECTURE SPECIFICATION

Tài liệu này quy định **Kiến trúc Layout Thanh công cụ Kép (Dual-Row Toolbar Architecture)** cho ứng dụng `teaching-app`. Hệ thống thanh công cụ được chia làm 2 tầng rõ ràng: **Thanh công cụ chính (Pinned Main Toolbar)** cố định 100% thời gian và **Thanh công cụ mở rộng (Contextual Extended Toolbar)** hiển thị động theo đúng công cụ hoặc đối tượng đang được chọn.

---

## 1. DUAL-ROW LAYOUT OVERVIEW (TỔNG QUAN KIẾN TRÚC 2 TẦNG)

```
+---------------------------------------------------------------------------------------------------------+
| ROW 1: PINNED MAIN TOOLBAR (Thanh công cụ chính - Cố định 100% thời gian)                              |
| [Logo/Brand] [Slide/Whiteboard Switcher]  [Tool Buttons: V B E T R C -> |]  [Undo Redo Clear] [Export]   |
+---------------------------------------------------------------------------------------------------------+
| ROW 2: CONTEXTUAL EXTENDED TOOLBAR (Thanh mở rộng Extend - Hiện động theo ngữ cảnh chọn)                |
| [📌 Ngữ cảnh] [Custom Font/Size] [Bold/Italic] [Align] [Màu chữ] [Màu nền Ø] [Màu viền Ø] [Viền] [Xóa] |
+---------------------------------------------------------------------------------------------------------+
```

---

## 2. QUY ĐỊNH CHI TIẾT HÀNG 1: PINNED MAIN TOOLBAR (THANH CHÍNH CỐ ĐỊNH)

### 2.1. Đặc tính Kỹ thuật
- **Vị trí:** Ghim cố định ở vị trí trên cùng màn hình (`top-0`, `z-30` / `z-40`).
- **Trạng thái hiển thị:** Luôn luôn hiện (Pinned / Always Visible).
- **Style:** Background mờ `bg-white/90 dark:bg-slate-900/90`, `backdrop-blur-md`, viền dưới `border-b border-slate-200 dark:border-slate-800`.

### 2.2. Các Nhóm Công cụ Cốt lõi trên Hàng 1
1. **Nhóm Điều hướng & Thương hiệu (Brand & Nav):**
   - Logo GraduationCap, Tên bài học / Tên session.
   - Nút Đổi bài / Import (khi có bài học active).
2. **Nhóm Chuyển đổi Chế độ (View Mode Switcher):**
   - Nút **`Slide Chiếu`** (Presentation Mode).
   - Nút **`Bảng Trắng`** (Fullscreen Interactive Whiteboard Mode).
3. **Nhóm Công cụ Vẽ & Tương tác Căn bản (Primary Toolset):**
   - `select` (V): Con trỏ chọn & di chuyển đối tượng.
   - `pencil` (B): Bút vẽ tự do (kèm menu thả màu nét & cỡ nét).
   - `eraser` (E): Tẩy xóa nét vẽ.
   - `text` (T): Khung chữ PowerPoint.
   - `rectangle` (R): Hình chữ nhật.
   - `circle` (C): Hình tròn.
   - `arrow`: Mũi tên.
   - `line`: Đường thẳng.
4. **Nhóm Thao tác Toàn cục (Global Actions):**
   - Hoàn tác (`RotateCcw` / Ctrl+Z).
   - Làm lại (`RotateCw` / Ctrl+Y).
   - Xóa sạch nét vẽ trang hiện tại (`Trash2` / Ctrl+E).
   - Nút Gọi học sinh ngẫu nhiên (`Users`).
   - Nút Đếm ngược / Hẹn giờ bài học (`Timer`).
   - Nút Xuất file / Lưu bài giảng (`Save`).

---

## 3. QUY ĐỊNH CHI TIẾT HÀNG 2: CONTEXTUAL EXTENDED TOOLBAR (SECTION EXTEND)

### 3.1. Động lực học & Cơ chế Kích hoạt 2 Chiều (2-Way Trigger Architecture)

Thanh công cụ mở rộng (Row 2 Extend) được hiển thị linh hoạt theo **2 Phương thức kích hoạt song song (Dual Trigger Methods)**:

1. **Phương thức 1: Click chọn Đối tượng trên Canvas (Entity Selection Trigger)**
   - **Kích hoạt:** Khi người dùng click chọn 1 đối tượng có sẵn trên màn hình (VD: Khung chữ `selectedAnnotation.type === 'text'`, Shape, Bảng, Ảnh).
   - **Tác dụng:** Thanh Extend hiển thị tất cả thuộc tính hiện tại của đối tượng được chọn. Mọi thao tác chỉnh sửa (font, cỡ chữ, màu sắc, viền, căn lề) sẽ cập nhật trực tiếp vào đối tượng đó (`onUpdateSelectedAnnotation`).
   - **Nút bổ sung:** Hiển thị nút Nhân bản (Duplicate `Ctrl+D`) và nút Xóa đối tượng (Delete).
   - **Badge hiển thị:** `📌 Khung Chữ (Đang chọn)` hoặc `📌 Đối tượng đang chọn`.

2. **Phương thức 2: Chọn Công cụ Tạo mới trên Thanh chính (Tool Selection Trigger)**
   - **Kích hoạt:** Khi người dùng click chọn một công cụ tạo mới trên Hàng 1 (VD: Chọn `Khung chữ (T)` - `activeTool === 'text'`), dù chưa có đối tượng nào được chọn trên màn hình (`selectedAnnotation === null`).
   - **Tác dụng:** Thanh Extend ngay lập tức mở ra để người dùng cấu hình trước các thông số mặc định (Font chữ, cỡ chữ, màu chữ, màu nền, viền...). Khi người dùng click/kéo trên Canvas để tạo đối tượng mới, đối tượng đó sẽ kế thừa toàn bộ các thiết lập mặc định này.
   - **Nút ẩn/hiện:** Nút Xóa / Duplicate ẩn đi (vì chưa có entity cụ thể).
   - **Badge hiển thị:** `📌 Cấu hình Khung Chữ`.

- **Hiệu ứng chuyển cảnh:** Mở rộng mượt mà bên dưới Hàng 1 với animation `animate-in slide-in-from-top-1 duration-150`.
- **Tự động ẩn:** Khi người dùng chuyển công cụ sang `Con trỏ (V)` hoặc click ra ngoài vùng trống Slide (Deselect), thanh Extend tự động đóng lại để trả lại không gian tối đa cho bài học.

### 3.2. Bảng Ánh xạ Ngữ cảnh (Contextual Mapping Matrix)

| Ngữ cảnh Tương tác (Context Trigger) | Kích hoạt (Trigger Method) | Component Mở rộng | Danh sách Công cụ Hiển thị trên Thanh Extend |
| :--- | :--- | :--- | :--- |
| **Đang chọn Khung chữ** | Method 1 (`selectedAnnotation.type === 'text'`) | `TextBoxContextualSection.tsx` | - Badge `📌 Khung Chữ (Đang chọn)`<br>- Custom Font Select (`CustomDropdownSelect`)<br>- Font Size Stepper & Select<br>- Bold, Italic, Underline, Strikethrough<br>- Alignments (Trái, Giữa, Phải, Đều)<br>- `ColorSwatchPicker` Màu chữ<br>- `ColorSwatchPicker` Màu nền (kèm reset `Ø`)<br>- `ColorSwatchPicker` Màu viền (kèm reset `Ø`)<br>- Custom Border Style & Width Select<br>- `Auto-fit` / `Fixed bounds`<br>- Duplicate (`Ctrl+D`) & Delete |
| **Đang chọn Tool Khung chữ (T)** | Method 2 (`activeTool === 'text' & !selectedAnnotation`) | `TextBoxContextualSection.tsx` | - Badge `📌 Cấu hình Khung Chữ`<br>- Thiết lập thuộc tính mặc định trước khi vẽ (Font, Cỡ chữ, Màu chữ, Màu nền, Màu viền, Căn lề...)<br>- (Nút Xóa / Duplicate ẩn) |
| **Đang chọn Bút vẽ (B)** | Method 2 (`activeTool === 'pencil'`) | `PencilPropertyDropdown` | - Swatches màu nét vẽ Presets<br>- Thanh trượt cỡ nét vẽ Range Slider (`1px` - `24px`) |
| **Đang chọn Hình vẽ Shape** | Method 1 (`selectedAnnotation.type !== 'text'`) | `ShapeContextualSection` | - Badge `📌 Thuộc tính Hình vẽ`<br>- `ColorSwatchPicker` Màu nét & Màu tô<br>- Border Width & Border Style<br>- Nút Xóa đối tượng |
| **Đang chọn Bảng** | Method 1 (`type === 'table'` - Tương lai) | `TableContextualSection` | - Badge `📌 Thuộc tính Bảng`<br>- Thêm/Xóa Hàng & Cột, Trộn/Tách ô<br>- `ColorSwatchPicker` Màu nền ô & Màu lưới |
| **Đang chọn Hình ảnh** | Method 1 (`type === 'image'` - Tương lai) | `ImageContextualSection` | - Badge `📌 Thuộc tính Hình ảnh`<br>- Crop, Bo góc, Xoay ảnh, Màu viền |

---

## 4. QUY ĐỊNH CHUẨN GIAO DIỆN & TÁI SỬ DỤNG COMPONENT

1. **Chiều cao & Khoảng cách (Spacing Standard):**
   - Hàng 1 (Pinned Toolbar): Chiều cao `h-14` / `h-16`, padding `px-4 py-2`.
   - Hàng 2 (Extend Toolbar): Chiều cao tự điều chỉnh `py-1.5 px-4`, `gap-2`.
   - Tất cả nút bấm trên Hàng Extend dùng chiều cao chuẩn `h-7`, bo góc `rounded-lg`, font-size `text-xs`.

2. **Quy định Tái sử dụng Component:**
   - **Màu sắc:** Bắt buộc dùng `ColorSwatchPicker` (`src/features/ppt-text-box/components/ColorSwatchPicker.tsx`).
   - **Dropdown:** Bắt buộc dùng `CustomDropdownSelect` (`src/features/ppt-text-box/components/CustomDropdownSelect.tsx`).
   - **Phân cách:** Dùng `<div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />` giữa các nhóm nút.

---

## 5. BẢN VẼ CODE MẪU CHO DEVELOPER / AI AGENT

Khi đăng ký thêm thanh Extend mới trong `ToolPropertyBar.tsx`:

```tsx
{/* ROW 2: EXTENDED CONTEXTUAL PROPERTY SECTION */}
{(selectedAnnotation || settings.activeTool === 'text') && (
  <div className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-950/80 px-4 py-1.5 flex flex-wrap items-center justify-between gap-3 text-xs animate-in slide-in-from-top-1 duration-150">
    <div className="flex items-center gap-2 flex-wrap">
      {/* METHOD 1: EXTEND FOR SELECTED TEXT BOX */}
      {selectedAnnotation?.type === 'text' && (
        <TextBoxContextualSection
          annotation={selectedAnnotation}
          onUpdateAnnotation={onUpdateSelectedAnnotation}
          onDeleteAnnotation={onDeleteSelectedAnnotation}
        />
      )}

      {/* METHOD 2: EXTEND FOR CREATION TOOL (E.G. TEXT TOOL DEFAULT SETTINGS) */}
      {!selectedAnnotation && settings.activeTool === 'text' && (
        <TextBoxContextualSection
          annotation={createDefaultSyntheticAnnotation(settings)}
          onUpdateAnnotation={(updated) => updateToolDefaultSettings(updated)}
        />
      )}

      {/* EXTEND FOR SHAPES */}
      {selectedAnnotation && selectedAnnotation.type === 'shape' && (
        <ShapeContextualSection
          annotation={selectedAnnotation}
          onUpdateAnnotation={onUpdateSelectedAnnotation}
          onDeleteAnnotation={onDeleteSelectedAnnotation}
        />
      )}
    </div>
  </div>
)}
```
