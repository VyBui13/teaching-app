# INTERACTIVE CANVAS ELEMENT SPECIFICATION & BUILDER GUIDE

Tài liệu này quy định **Kiến trúc chuẩn (Architecture Standard)**, **Vòng đời tương tác (State Machine)**, **Tối ưu hiệu năng 60 FPS (Zero-Lag Architecture)**, và **Hướng dẫn từng bước (Implementation Blueprint)** để phát triển các đối tượng tương tác trên Slide Canvas (như Khung chữ/Text Box, Hình khối/Shape, Bảng/Table, Hình ảnh/Image) trong dự án `teaching-app`.

---

## 1. TRI-LAYER ARCHITECTURE (KIẾN TRÚC 3 LỚP CHUẨN)

Mọi đối tượng canvas tương tác (Interactive Canvas Element) trong hệ thống bắt buộc tuân theo kiến trúc 3 lớp phân tách rõ ràng:

1. **Layer 1: Domain & State Schema (`AnnotationEntity` / `Props`)**
   - Định nghĩa thuộc tính schema (`x, y, width, height, zIndex, isLocked, style, data`).
   - Serialize/Deserialize JSON với LocalStorage Repository & Session.

2. **Layer 2: High-Performance Controller & DOM Render (`usePPTTextBoxController` / Pointer Capture / rAF)**
   - Sử dụng GPU `translate3d(x, y, 0)` & `width`/`height` biến đổi trực tiếp trên DOM node `ref`.
   - Bounding Box 8 điểm neo (`nw`, `n`, `ne`, `e`, `se`, `s`, `sw`, `w`) với visual 10x10px & hitbox 20x20px.
   - Khóa tỷ lệ khung hình khi giữ phím `Shift`.
   - Giới hạn kích thước tối thiểu `minWidth = 50px, minHeight = 30px`.
   - Thuật toán gióng lề thông minh (`calculateSnapping`).

3. **Layer 3: Top Contextual Property Bar Section (`ToolPropertyBar` Extension)**
   - Khung thuộc tính mở rộng ngữ cảnh phía trên (`ContextualPropertySection`).
   - Thành phần chọn màu tái sử dụng `ColorSwatchPicker` (13 màu có sẵn + Tùy chỉnh + Nút reset Không màu `Ø`).
   - Component Dropdown tái sử dụng `CustomDropdownSelect` (chuẩn phong cách ShadCN UI / Radix UI).

---

## 2. NGUYÊN TẮC TỐI ƯU HIỆU NĂNG 60 FPS (ZERO-LAG PRINCIPLES)

1. **Tuyệt đối không trigger React Re-render liên tục trên `pointermove`:**
   - Sử dụng `requestAnimationFrame` (rAF) kết hợp biến đổi trực tiếp thuộc tính DOM element qua `ref.current.style.transform`.
   - Chỉ commit tọa độ/kích thước thực tế vào React State/Store khi nhả chuột (`pointerup`).

2. **Pointer Capture chống trượt chuột:**
   - Mọi sự kiện `pointerdown` trên khối hoặc điểm neo phải gọi `e.currentTarget.setPointerCapture(e.pointerId)`.

3. **Tự động chuyển Tool & Khóa phím Delete:**
   - Khi hoàn tất nhập dữ liệu và click ra ngoài, hệ thống tự động chọn đối tượng và chuyển công cụ sang **"Con trỏ (V)"**.
   - Bấm phím **`Delete`** hoặc **`Backspace`** khi đang chọn đối tượng sẽ lập tức xóa đối tượng.

---

## 3. THÀNH PHẦN UI TÁI SỬ DỤNG (REUSABLE UI COMPONENTS)

### A. Component Chọn Màu `ColorSwatchPicker`
Location: `src/features/ppt-text-box/components/ColorSwatchPicker.tsx`

```tsx
import { ColorSwatchPicker } from '@/features/ppt-text-box/components/ColorSwatchPicker';

<ColorSwatchPicker
  label="Màu nền"
  value={currentBgColor}
  onChange={(color) => updateProps({ fillColor: color })}
  allowTransparent={true} // Bật nút reset "Không màu (No Fill / Ø)"
  type="bg"               // 'text' | 'bg' | 'border'
/>
```

### B. Component Dropdown `CustomDropdownSelect`
Location: `src/features/ppt-text-box/components/CustomDropdownSelect.tsx`

```tsx
import { CustomDropdownSelect } from '@/features/ppt-text-box/components/CustomDropdownSelect';

<CustomDropdownSelect
  value={currentBorderStyle}
  options={BORDER_STYLE_OPTIONS}
  onChange={(styleVal) => updateProps({ borderStyle: styleVal })}
  title="Kiểu đường viền"
/>
```

---

## 4. THIẾT KẾ CHO ĐỐI TƯỢNG HÌNH KHỐI (SHAPES BLUEPRINT)

### Data Schema (`ShapeAnnotationProps`)
```typescript
export interface ShapeAnnotationProps extends AnnotationProps {
  shapeType: 'rectangle' | 'circle' | 'arrow' | 'star' | 'callout';
  fillColor: string;       // Màu nền shape ('transparent' hoặc Hex)
  borderColor: string;     // Màu đường viền ('transparent' hoặc Hex)
  borderWidth: number;     // Độ dày viền (px)
  borderStyle: BorderStyle;// 'solid' | 'dashed' | 'dotted' | 'none'
  borderRadius?: number;   // Bo góc shape (px)
}
```

### Contextual Section (`ShapeContextualSection.tsx`)
- `<ColorSwatchPicker label="Màu nền" type="bg" allowTransparent={true} />`
- `<ColorSwatchPicker label="Màu viền" type="border" allowTransparent={true} />`
- `<CustomDropdownSelect options={BORDER_STYLE_OPTIONS} />`
- `<CustomDropdownSelect options={BORDER_WIDTH_OPTIONS} />`

---

## 5. THIẾT KẾ CHO ĐỐI TƯỢNG BẢNG (TABLES BLUEPRINT)

### Data Schema (`TableAnnotationProps`)
```typescript
export interface TableCell {
  id: string;
  text: string;
  style?: {
    fontSize?: number;
    textColor?: string;
    backgroundColor?: string;
    fontWeight?: 'normal' | 'bold';
    textAlign?: 'left' | 'center' | 'right';
  };
}

export interface TableAnnotationProps extends AnnotationProps {
  rows: number;
  cols: number;
  colWidths: number[];
  rowHeights: number[];
  cells: TableCell[][];
  headerRow?: boolean;
  stripedRows?: boolean;
  borderColor: string;
  borderWidth: number;
}
```

### Contextual Section (`TableContextualSection.tsx`)
- Thêm/Xóa hàng & cột (`Insert/Delete Row/Col`).
- Trộn ô / Tách ô (`Merge/Split Cells`).
- `<ColorSwatchPicker label="Màu nền ô" type="bg" allowTransparent={true} />`
- `<ColorSwatchPicker label="Màu viền bảng" type="border" allowTransparent={true} />`

---

## 6. QUY TRÌNH NÂNG CẤP DÀNH CHO DEVELOPER / AI AGENT

- [ ] **Bước 1 (Domain Model):** Thêm thuộc tính trong `AnnotationEntity.ts`.
- [ ] **Bước 2 (Controller Hook):** Tái sử dụng `usePPTTextBoxController` hoặc rAF transform loop.
- [ ] **Bước 3 (Contextual Section):** Tạo `<YourElementContextualSection />` dùng `ColorSwatchPicker` và `CustomDropdownSelect`.
- [ ] **Bước 4 (Canvas Registry):** Đăng ký nhánh render trong `AnnotationCanvasOverlay.tsx` và `ToolPropertyBar.tsx`.
- [ ] **Bước 5 (Build Check):** Chạy `npm run build` đảm bảo 0 lỗi.
