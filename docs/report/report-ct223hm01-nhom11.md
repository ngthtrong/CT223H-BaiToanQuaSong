# BÌA 1

**BỘ GIÁO DỤC VÀ ĐÀO TẠO**

**TRƯỜNG ĐẠI HỌC CẦN THƠ**

**TRƯỜNG CÔNG NGHỆ THÔNG TIN VÀ TRUYỀN THÔNG**

## ĐỒ ÁN MÔN HỌC NHẬP MÔN TRÍ TUỆ NHÂN TẠO CT223H

### Nhóm học phần: M01

**Đề tài**

# BÀI TOÁN QUA SÔNG

### Người nông dân, Sói, Dê và Bắp cải

**Nhóm 11 - Nhóm sinh viên thực hiện**

1. Nguyễn Thanh Trọng - B2305615 - Trưởng nhóm
2. Trần Hải Thiên - B2203580
3. Trương Trí Hào - B2203553

**Cần Thơ, 03/2026**

\newpage

# BÌA 2

**BỘ GIÁO DỤC VÀ ĐÀO TẠO**

**TRƯỜNG ĐẠI HỌC CẦN THƠ**

**TRƯỜNG CÔNG NGHỆ THÔNG TIN VÀ TRUYỀN THÔNG**

## ĐỒ ÁN MÔN HỌC NHẬP MÔN TRÍ TUỆ NHÂN TẠO CT223H

### Nhóm học phần: M01

**Đề tài**

# BÀI TOÁN QUA SÔNG

### Người nông dân, Sói, Dê và Bắp cải

**Giảng viên hướng dẫn:**

- TS. Lưu Tiến Đạo

**Nhóm 11 - Nhóm sinh viên thực hiện**

1. Nguyễn Thanh Trọng - B2305615 - Trưởng nhóm
2. Trần Hải Thiên - B2203580
3. Trương Trí Hào - B2203553

**Cần Thơ, 03/2026**

\newpage

# NHẬN XÉT CỦA GIẢNG VIÊN

- ........................................................................
- ........................................................................
- ........................................................................
- ........................................................................
- ........................................................................

*Cần Thơ, ngày ... tháng ... năm 2026*

*(Ký và ghi rõ họ tên)*

\newpage

# MỤC LỤC

1. Mô tả bài toán
2. Phân tích bài toán
3. Cơ sở lý thuyết
4. Thiết kế và cài đặt
5. Kết quả và đánh giá
6. Kết luận và hướng phát triển
7. Tài liệu tham khảo

\newpage

# PHÂN CÔNG CÔNG VIỆC

| STT | Họ tên | MSSV | Nội dung phân công |
| --- | --- | --- | --- |
| 1 | Nguyễn Thanh Trọng | B2305615 | Phân tích đề tài, mô hình hóa không gian trạng thái, cài đặt BFS và DFS, tổng hợp nội dung báo cáo |
| 2 | Trần Hải Thiên | B2203580 | Cài đặt A* và IDA*, xây dựng hàm heuristic, kiểm thử quá trình tìm kiếm |
| 3 | Trương Trí Hào | B2203553 | Thiết kế giao diện React, trực quan hóa cây trạng thái, hoàn thiện phần đánh giá và trình bày |

\newpage

# PHẦN NỘI DUNG

## 1. Mô tả bài toán

### 1.1. Giới thiệu

Bài toán qua sông là một bài toán kinh điển trong trí tuệ nhân tạo, thường được dùng để minh họa cách mô hình hóa bài toán dưới dạng không gian trạng thái và đánh giá hiệu quả của các giải thuật tìm kiếm. Trong đề tài này, đối tượng cần di chuyển gồm người nông dân, sói, dê và bắp cải. Mỗi lần qua sông, chiếc thuyền chỉ chở được người nông dân và tối đa một đối tượng đi kèm.

Ý nghĩa của bài toán không nằm ở độ lớn của không gian trạng thái mà ở chỗ nó thể hiện rõ ba yếu tố quan trọng của AI cơ bản:

- Cần mô hình hóa đúng trạng thái và hành động.
- Cần kiểm tra ràng buộc để loại bỏ trạng thái không hợp lệ.
- Có thể so sánh trực tiếp giữa tìm kiếm mù và tìm kiếm có thông tin.

### 1.2. Phát biểu bài toán

Người nông dân cần đưa sói, dê và bắp cải từ bờ trái sang bờ phải. Các ràng buộc như sau:

- Nếu sói ở cùng bờ với dê mà không có người nông dân, sói sẽ ăn dê.
- Nếu dê ở cùng bờ với bắp cải mà không có người nông dân, dê sẽ ăn bắp cải.
- Thuyền luôn phải có người nông dân điều khiển.
- Mỗi chuyến thuyền chỉ chở được người nông dân và nhiều nhất một đối tượng trong ba đối tượng còn lại.

Mục tiêu là tìm được một dãy hành động hợp lệ để đưa toàn bộ bốn thực thể sang bờ phải an toàn.

### 1.3. Thành phần của bài toán tìm kiếm

#### a. Không gian trạng thái

Mỗi trạng thái được biểu diễn bởi vị trí của bốn thực thể:

$$
S = (F, W, G, C)
$$

Trong đó:

- $F$: vị trí của người nông dân.
- $W$: vị trí của sói.
- $G$: vị trí của dê.
- $C$: vị trí của bắp cải.

Mỗi thành phần nhận một trong hai giá trị:

- `L`: bờ trái.
- `R`: bờ phải.

Trong mã nguồn, trạng thái được cài đặt bằng kiểu `PuzzleState` với bốn trường `farmer`, `wolf`, `goat`, `cabbage`, mỗi trường có kiểu `Side = 'L' | 'R'`.

#### b. Trạng thái đầu

$$
S_0 = (L, L, L, L)
$$

Tức là toàn bộ thực thể đều ở bờ trái.

#### c. Trạng thái đích

$$
S_{goal} = (R, R, R, R)
$$

Tức là toàn bộ thực thể đều ở bờ phải.

#### d. Tập hành động

Từ một trạng thái bất kỳ, người nông dân có thể thực hiện một trong các hành động:

- Đi một mình sang bờ đối diện.
- Chở sói sang bờ đối diện nếu sói đang cùng bờ với người nông dân.
- Chở dê sang bờ đối diện nếu dê đang cùng bờ với người nông dân.
- Chở bắp cải sang bờ đối diện nếu bắp cải đang cùng bờ với người nông dân.

Trong mã nguồn, hàm `generateMoves` tạo các hành động hợp lệ theo đúng nguyên tắc trên.

#### e. Hàm chuyển trạng thái

Sau khi chọn một hành động, hệ thống cập nhật vị trí của người nông dân và đối tượng được chở. Việc chuyển trạng thái được thực hiện trong hàm `applyMove`.

#### f. Điều kiện hợp lệ

Một trạng thái bị xem là không hợp lệ nếu xảy ra một trong hai tình huống:

- Sói và dê ở cùng một bờ, còn người nông dân ở bờ bên kia.
- Dê và bắp cải ở cùng một bờ, còn người nông dân ở bờ bên kia.

Trong mã nguồn, hàm `getInvalidReason` trả về nguyên nhân loại bỏ trạng thái nếu trạng thái đó vi phạm ràng buộc.

### 1.4. Mục tiêu của đồ án

Đồ án hướng đến các mục tiêu chính sau:

- Mô hình hóa bài toán qua sông dưới dạng bài toán tìm kiếm trong không gian trạng thái.
- Cài đặt và so sánh bốn giải thuật: BFS, DFS, A* và IDA*.
- Xây dựng ứng dụng web trực quan hỗ trợ chạy toàn bộ hoặc từng bước.
- Minh họa cây trạng thái, lời giải, chỉ số thực thi và vai trò của heuristic.
- Tạo sản phẩm có thể dùng cho học tập, trình bày và minh họa trên lớp.

## 2. Phân tích bài toán

### 2.1. Đặc trưng của không gian trạng thái

Với bốn thực thể, số trạng thái lý thuyết là:

$$
2^4 = 16
$$

Tuy nhiên không phải trạng thái nào cũng hợp lệ do các ràng buộc ăn thịt. Sau khi loại bỏ các trạng thái vi phạm, bài toán còn một tập trạng thái hợp lệ nhỏ, đủ để minh họa rõ quy trình tìm kiếm mà vẫn phù hợp cho trực quan hóa trên giao diện web.

Đặc điểm này dẫn đến hai hệ quả:

- Bài toán đủ nhỏ để quan sát toàn bộ cây tìm kiếm.
- Chất lượng thuật toán vẫn thể hiện được qua thứ tự mở rộng nút, số nút sinh ra, kích thước biên và độ rõ ràng của lời giải.

### 2.2. Biểu diễn trạng thái trong chương trình

Mỗi trạng thái được chuyển thành một khóa chuỗi dạng `FWGC`, ví dụ:

- `LLLL`: trạng thái ban đầu.
- `RLRL`: nông dân và dê ở bờ phải, sói và bắp cải ở bờ trái.
- `RRRR`: trạng thái đích.

Cách biểu diễn này giúp:

- So sánh trạng thái nhanh.
- Lưu vết trong cấu trúc `Map` để tránh mở rộng lặp.
- Hiển thị ngắn gọn trên sơ đồ cây trạng thái.

### 2.3. Hàm heuristic được dùng trong dự án

Để phục vụ A* và IDA*, dự án hiện cài đặt hai heuristic trong tệp `heuristics.ts`.

#### a. Heuristic 1: remaining-items

Heuristic này đếm số đối tượng trong tập `{sói, dê, bắp cải}` chưa sang bờ phải:

$$
h_1(s) = |\{x \in \{W, G, C\} : x = L\}|
$$

Ý nghĩa: mỗi đối tượng còn ở bờ trái ít nhất vẫn cần được đưa sang bờ phải một lần. Đây là heuristic đơn giản, dễ hiểu và phù hợp để minh họa A*.

#### b. Heuristic 2: remaining-trips

Heuristic thứ hai ước lượng số chuyến còn lại bằng cách lấy số đối tượng chưa sang đích cộng thêm một lượt quay về nếu người nông dân đang ở bờ phải nhưng vẫn còn đối tượng ở bờ trái:

$$
h_2(s) = h_1(s) +
\begin{cases}
1 & \text{nếu } F = R \text{ và vẫn còn đối tượng ở bờ trái} \\
0 & \text{ngược lại}
\end{cases}
$$

Heuristic này mang tính trực quan cao hơn vì có xét đến việc người nông dân phải quay lại để tiếp tục vận chuyển.

### 2.4. Lý do chọn bốn thuật toán

Báo cáo này chỉ tập trung vào bốn thuật toán:

- BFS đại diện cho tìm kiếm theo chiều rộng.
- DFS đại diện cho tìm kiếm theo chiều sâu.
- A* đại diện cho tìm kiếm có thông tin sử dụng hàm đánh giá.
- IDA* đại diện cho biến thể tiết kiệm bộ nhớ của A*.

Việc giới hạn phạm vi như vậy giúp báo cáo bám sát trọng tâm môn học: so sánh tìm kiếm mù và tìm kiếm có thông tin trên cùng một bài toán logic nhỏ.

## 3. Cơ sở lý thuyết

### 3.1. BFS - Breadth-First Search

BFS duyệt các trạng thái theo từng mức độ sâu. Giải thuật dùng hàng đợi FIFO, luôn mở rộng các nút được sinh ra sớm hơn trước.

Các đặc điểm chính:

- Hoàn chỉnh nếu không gian trạng thái hữu hạn.
- Tìm được lời giải tối ưu khi mọi bước đi có cùng chi phí.
- Tốn bộ nhớ vì phải giữ toàn bộ biên của từng tầng.

Giả mã ngắn gọn:

```text
Khởi tạo hàng đợi với trạng thái đầu
Lặp khi hàng đợi còn phần tử
  Lấy phần tử đầu hàng đợi
  Nếu là đích thì dừng
  Sinh các trạng thái con hợp lệ và thêm vào cuối hàng đợi
```

Trong bài toán qua sông, BFS phù hợp để tìm lời giải ngắn nhất theo số bước vì mỗi lần di chuyển đều có chi phí bằng 1.

### 3.2. DFS - Depth-First Search

DFS mở rộng nút theo chiều sâu trước bằng ngăn xếp LIFO. Thuật toán đi sâu vào một nhánh cho đến khi không thể tiếp tục mới quay lui.

Các đặc điểm chính:

- Cài đặt đơn giản.
- Dùng ít bộ nhớ hơn BFS.
- Không bảo đảm lời giải tối ưu.
- Phụ thuộc mạnh vào thứ tự sinh các trạng thái con.

Giả mã ngắn gọn:

```text
Khởi tạo ngăn xếp với trạng thái đầu
Lặp khi ngăn xếp còn phần tử
  Lấy phần tử trên cùng
  Nếu là đích thì dừng
  Sinh các trạng thái con hợp lệ và đẩy vào ngăn xếp
```

Trong dự án, DFS vẫn tìm được lời giải trên bài toán gốc, nhưng điều này không có nghĩa là thuật toán luôn tối ưu trên mọi bài toán hoặc mọi thứ tự duyệt.

### 3.3. A* Search

A* là thuật toán tìm kiếm có thông tin, sử dụng hàm đánh giá:

$$
f(n) = g(n) + h(n)
$$

Trong đó:

- $g(n)$ là chi phí từ trạng thái đầu đến nút hiện tại.
- $h(n)$ là ước lượng chi phí còn lại từ nút hiện tại đến đích.

Các đặc điểm chính:

- Nếu heuristic phù hợp, A* tìm được lời giải tối ưu.
- Hiệu quả tốt hơn BFS khi heuristic giúp ưu tiên đúng các nút hứa hẹn.
- Cần bộ nhớ để lưu biên và tập trạng thái đã biết.

Trong mã nguồn, các nút trên frontier được sắp xếp theo `f`, nếu hòa thì xét thêm `h` và `g`. Điều này giúp ổn định thứ tự chọn nút trên bài toán nhỏ.

### 3.4. IDA* - Iterative Deepening A*

IDA* kết hợp ý tưởng của A* và tìm kiếm sâu dần. Thay vì giữ toàn bộ hàng đợi ưu tiên như A*, IDA* duyệt sâu có giới hạn theo ngưỡng của hàm `f`.

Quy trình cơ bản:

1. Khởi tạo ngưỡng bằng `h(trạng thái đầu)`.
2. Thực hiện DFS nhưng chỉ cho phép các nút có `f <= ngưỡng`.
3. Nếu chưa tìm thấy lời giải, lấy giá trị `f` nhỏ nhất vượt ngưỡng làm ngưỡng mới.
4. Lặp lại đến khi tìm được lời giải hoặc không còn khả năng mở rộng.

Ưu điểm chính của IDA* là tiết kiệm bộ nhớ hơn A*. Nhược điểm là phải lặp lại nhiều lần theo các ngưỡng tăng dần, vì vậy thời gian chạy có thể tăng.

### 3.5. So sánh lý thuyết giữa bốn thuật toán

| Thuật toán | Loại tìm kiếm | Cấu trúc chính | Tối ưu | Bộ nhớ |
| --- | --- | --- | --- | --- |
| BFS | Tìm kiếm mù | Hàng đợi | Có, khi chi phí đều nhau | Cao |
| DFS | Tìm kiếm mù | Ngăn xếp | Không bảo đảm | Thấp |
| A* | Tìm kiếm có thông tin | Biên ưu tiên theo `f=g+h` | Có nếu heuristic phù hợp | Cao |
| IDA* | Tìm kiếm có thông tin | DFS theo ngưỡng `f` | Có nếu heuristic phù hợp | Thấp hơn A* |

## 4. Thiết kế và cài đặt

### 4.1. Công nghệ sử dụng

Dự án được xây dựng dưới dạng ứng dụng web tương tác với các công nghệ chính sau:

- React 19 cho giao diện thành phần.
- TypeScript để tăng độ an toàn kiểu dữ liệu.
- Vite cho môi trường phát triển và đóng gói.
- Ant Design cho hệ thống giao diện và các thành phần bảng, thẻ, nút, thống kê.
- React Flow để trực quan hóa cây trạng thái.
- SVG minh họa nhân vật và đối tượng trên sông.

Kiến trúc công nghệ này phù hợp với yêu cầu của một ứng dụng dạy học vì dễ thao tác, dễ trình bày trên lớp và hiển thị trực quan.

### 4.2. Kiến trúc mã nguồn

Chương trình được tổ chức thành các nhóm chức năng chính:

- `src/algorithms/solver.ts`: cài đặt mô hình trạng thái, sinh hành động, kiểm tra đích, BFS, DFS, A* và IDA*.
- `src/algorithms/heuristics.ts`: cài đặt hai hàm heuristic.
- `src/types/puzzle.ts`: định nghĩa kiểu dữ liệu cho trạng thái, nút tìm kiếm, kết quả và thống kê.
- `src/components/RiverScene.tsx`: hiển thị người nông dân, sói, dê, bắp cải ở hai bờ sông.
- `src/components/StateTree.tsx`: trực quan hóa cây tìm kiếm bằng React Flow.
- `src/components/PseudocodePanel.tsx`: hiển thị giả mã của thuật toán đang chọn.
- `src/App.tsx`: phối hợp điều khiển giao diện, thực thi thuật toán, chế độ chạy từng bước và bảng so sánh lịch sử.

### 4.3. Cấu trúc dữ liệu chính

Trạng thái bài toán được định nghĩa như sau:

```ts
export interface PuzzleState {
  farmer: 'L' | 'R'
  wolf: 'L' | 'R'
  goat: 'L' | 'R'
  cabbage: 'L' | 'R'
}
```

Mỗi nút trong cây tìm kiếm được lưu cùng các thông tin:

- `parentId`: liên kết đến nút cha.
- `stateKey`: chuỗi đại diện cho trạng thái.
- `depth`: độ sâu của nút.
- `g`, `h`, `f`: các giá trị đánh giá phục vụ tìm kiếm có thông tin.
- `valid`: đánh dấu trạng thái hợp lệ hay không.
- `prunedReason`: lý do bị loại nếu nút không được tiếp tục mở rộng.
- `expandedOrder`: thứ tự mở rộng, phục vụ chế độ mô phỏng từng bước.

Thiết kế này giúp cùng một cấu trúc có thể hỗ trợ cả phần thuật toán lẫn phần trực quan hóa.

### 4.4. Cài đặt kiểm tra ràng buộc

Ràng buộc được cài đặt trực tiếp trong hàm kiểm tra trạng thái:

```ts
if (state.wolf === state.goat && state.farmer !== state.goat) {
  return 'Sói sẽ ăn dê khi nông dân vắng mặt.'
}

if (state.goat === state.cabbage && state.farmer !== state.goat) {
  return 'Dê sẽ ăn bắp cải khi nông dân vắng mặt.'
}
```

Nếu ràng buộc bị vi phạm, nút vẫn được ghi nhận vào cây để người học thấy lý do bị loại, nhưng không được đưa vào biên tiếp theo. Đây là một điểm mạnh của hệ thống trực quan vì thể hiện được không chỉ nhánh đúng mà cả các nhánh sai.

### 4.5. Cài đặt các giải thuật trong dự án

#### a. BFS và DFS

Hai thuật toán này dùng chung phần sinh trạng thái. Khác biệt chính nằm ở cách lấy phần tử từ biên:

- BFS lấy từ đầu mảng.
- DFS lấy từ cuối mảng.

Nhờ thiết kế chung, các chỉ số như số nút sinh, số nút duyệt và biên tối đa được đo trên cùng một cách tổ chức dữ liệu, thuận tiện cho so sánh.

#### b. A*

A* dùng danh sách frontier và sắp xếp theo `f`, sau đó chọn nút có giá trị nhỏ nhất. Trên bài toán nhỏ, cài đặt này đủ đơn giản để đọc và đủ rõ để minh họa trên lớp.

#### c. IDA*

IDA* được cài đặt bằng hàm tìm kiếm giới hạn theo `threshold`. Khi một nút có `f` vượt ngưỡng hiện tại, hệ thống không mở rộng nút đó và lưu lại giá trị `f` vượt ngưỡng nhỏ nhất để tạo ngưỡng mới cho vòng lặp kế tiếp.

### 4.6. Thiết kế giao diện

Giao diện của chương trình không chỉ phục vụ chạy thuật toán mà còn phục vụ giảng dạy. Các thành phần nổi bật gồm:

- Khối chọn thuật toán và heuristic.
- Hai chế độ chạy: chạy toàn bộ và chạy từng bước.
- Cảnh bờ trái, bờ phải và thuyền giúp quan sát trạng thái tức thời.
- Khung giả mã có tô sáng dòng đang hoạt động.
- Sơ đồ cây trạng thái có thể chọn từng nút để quan sát.
- Thẻ thống kê hiển thị số nút duyệt, số nút sinh, biên tối đa, thời gian, độ sâu lời giải và chi phí lời giải.
- Bảng lịch sử để chạy lần lượt nhiều thuật toán và đối chiếu kết quả.

Điểm đáng chú ý là dự án kết hợp tốt giữa phần thuật toán và phần trực quan. Điều này làm tăng giá trị học tập so với một chương trình chỉ in kết quả ra màn hình console.

## 5. Kết quả và đánh giá

### 5.1. Kết quả chạy hệ thống

Qua việc kiểm tra và đóng gói dự án hiện tại, ứng dụng build thành công với lệnh:

```bash
npm run build
```

Điều này cho thấy phần cài đặt của dự án ở trạng thái hoạt động được và có thể dùng làm cơ sở cho báo cáo, trình diễn và nộp bài.

### 5.2. Lời giải của bài toán gốc

Một lời giải hợp lệ và tối ưu của bài toán gồm 7 bước:

1. Nông dân chở dê sang bờ phải.
2. Nông dân đi một mình về bờ trái.
3. Nông dân chở sói sang bờ phải.
4. Nông dân chở dê về bờ trái.
5. Nông dân chở bắp cải sang bờ phải.
6. Nông dân đi một mình về bờ trái.
7. Nông dân chở dê sang bờ phải.

Chuỗi hành động trên là lời giải chuẩn của bài toán, đồng thời cũng là đích mà các thuật toán tối ưu cần tìm được.

### 5.3. Đánh giá theo từng thuật toán

| Thuật toán | Kết quả trên bài toán gốc | Nhận xét |
| --- | --- | --- |
| BFS | Tìm được lời giải 7 bước | Ổn định, dễ giải thích, phù hợp để minh họa tìm kiếm theo tầng |
| DFS | Tìm được lời giải nhưng không có bảo đảm tối ưu tổng quát | Nhanh trên không gian nhỏ, nhưng phụ thuộc mạnh vào thứ tự sinh nhánh |
| A* | Tìm được lời giải với định hướng từ heuristic | Cân bằng tốt giữa tính đúng đắn và hiệu quả mở rộng nút |
| IDA* | Tìm được lời giải với heuristic và ngưỡng lặp | Tiết kiệm bộ nhớ hơn A*, đổi lại phải lặp nhiều vòng |

### 5.4. So sánh tìm kiếm mù và tìm kiếm có thông tin

Trên bài toán qua sông, sự khác biệt cốt lõi giữa hai nhóm thể hiện như sau:

- BFS và DFS chỉ dựa vào cấu trúc duyệt, không biết trạng thái nào gần đích hơn.
- A* và IDA* sử dụng heuristic để ưu tiên các trạng thái hứa hẹn.
- Với cùng một không gian trạng thái nhỏ, A* và IDA* cho thấy cách AI khai thác tri thức miền bài toán để giảm tìm kiếm không cần thiết.

Từ góc nhìn dạy học, đây là giá trị chính của đề tài: người học nhìn thấy rõ vì sao cùng một bài toán nhưng bổ sung heuristic lại làm thay đổi cách duyệt.

### 5.5. Ưu điểm của sản phẩm đã xây dựng

Sản phẩm hiện tại có một số điểm mạnh đáng ghi nhận:

- Giao diện hiện đại, có thể dùng trực tiếp để trình bày trên lớp.
- Cho phép xem lời giải theo từng bước thay vì chỉ xem kết quả cuối.
- Có cây trạng thái giúp phân tích nhánh đúng và nhánh bị loại.
- Có bảng so sánh lịch sử để chạy nhiều thuật toán liên tiếp.
- Có phần giả mã giúp liên hệ giữa lý thuyết và thực thi.

### 5.6. Hạn chế hiện tại

Bên cạnh các kết quả đạt được, dự án vẫn còn một số giới hạn:

- Bài toán chỉ xét phiên bản cơ bản với 4 thực thể, nên số trạng thái còn nhỏ.
- Chỉ số thực nghiệm chưa được xuất tự động ra tệp báo cáo hoặc CSV.
- Dự án phù hợp cho minh họa trực quan hơn là benchmark hiệu năng quy mô lớn.
- Chưa có phần giải thích tự động vì sao một heuristic tốt hơn heuristic khác trong từng trạng thái cụ thể.

## 6. Kết luận và hướng phát triển

### 6.1. Kết luận

Đồ án đã hoàn thành các mục tiêu quan trọng của môn học Nhập môn trí tuệ nhân tạo CT223H:

- Mô hình hóa bài toán qua sông thành bài toán tìm kiếm trạng thái.
- Cài đặt bốn thuật toán tiêu biểu: BFS, DFS, A* và IDA*.
- Xây dựng hai hàm heuristic để phục vụ tìm kiếm có thông tin.
- Phát triển ứng dụng web trực quan, hỗ trợ học tập và trình bày.

Qua đồ án, có thể rút ra nhận xét chính như sau:

- BFS là lựa chọn tốt khi cần lời giải ngắn nhất trên bài toán chi phí đều.
- DFS đơn giản và tiết kiệm bộ nhớ nhưng không phải lựa chọn an toàn nếu cần tối ưu.
- A* cho thấy hiệu quả của heuristic trong việc định hướng tìm kiếm.
- IDA* là phương án đáng chú ý khi muốn giữ lợi ích của heuristic nhưng giảm chi phí bộ nhớ.

Như vậy, đề tài không chỉ hoàn thành yêu cầu cài đặt giải thuật mà còn thể hiện được bản chất của tìm kiếm mù và tìm kiếm có thông tin thông qua một sản phẩm trực quan, dễ trình diễn và dễ phân tích.

### 6.2. Hướng phát triển

Trong các phiên bản tiếp theo, nhóm có thể mở rộng theo các hướng sau:

- Bổ sung chế độ xuất kết quả thực nghiệm ra tệp CSV hoặc PDF.
- Mở rộng bài toán sang nhiều đối tượng hơn hoặc thay đổi sức chứa thuyền.
- Bổ sung phần giải thích tự động cho từng bước suy luận của A* và IDA*.
- Thêm bộ so sánh trực tiếp số nút duyệt và thời gian giữa các lần chạy.
- Tối ưu đóng gói giao diện để giảm kích thước gói build.

\newpage

# TÀI LIỆU THAM KHẢO

1. Stuart Russell, Peter Norvig. *Artificial Intelligence: A Modern Approach*. Pearson.
2. Tài liệu đề tài môn học CT223H: bài toán qua sông người nông dân, sói, dê và bắp cải.
3. Tài liệu mã nguồn dự án web trực quan trong thư mục `src` của đồ án.
4. Tài liệu chính thức của React. https://react.dev
5. Tài liệu chính thức của Ant Design. https://ant.design
6. Tài liệu chính thức của React Flow. https://reactflow.dev