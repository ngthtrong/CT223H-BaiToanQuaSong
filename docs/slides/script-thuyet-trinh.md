# Script thuyết trình - Bài toán qua sông (10 phút)

## Tổng quan thời lượng
- Slide 1: 35 giây
- Slide 2: 35 giây
- Slide 3: 50 giây
- Slide 4: 70 giây
- Slide 5: 65 giây
- Slide 6: 85 giây
- Slide 7: 55 giây
- Slide 8: 45 giây
- Slide 9: 40 giây
- Slide 10: 45 giây
- Slide 11: 45 giây
- Slide 12: 40 giây
- Slide 13: 15 giây

---

## Slide 1 - Trang bìa
"Kính chào thầy và các bạn. Nhóm 11 xin trình bày đề tài Bài toán qua sông - Người nông dân, Sói, Dê và Bắp cải."

"Đề tài tập trung vào 3 mục tiêu: mô hình hóa bài toán AI, cài đặt nhiều thuật toán tìm kiếm, và trực quan hóa quá trình giải để phục vụ học tập."

---

## Slide 2 - Nội dung báo cáo
"Bố cục báo cáo gồm 7 phần: giới thiệu vấn đề, mô hình hóa bài toán, hàm heuristic đề xuất, giải thuật sử dụng, thiết kế cài đặt, kết quả, và kết luận."

"Hai phần được nhấn mạnh hôm nay là mô hình hóa state space và phân tích heuristic chi tiết cho A* và IDA*."

---

## Slide 3 - Giới thiệu vấn đề
"Bài toán yêu cầu đưa nông dân, sói, dê và bắp cải từ bờ trái sang bờ phải. Thuyền chỉ chở được nông dân và tối đa một đối tượng đi cùng."

"Ràng buộc an toàn là trọng tâm: nếu không có nông dân giám sát thì Sói không được đứng với Dê, và Dê không được đứng với Bắp cải."

"Do đó, đây là ví dụ điển hình cho bài toán tìm kiếm trong không gian trạng thái có ràng buộc."

---

## Slide 4 - Mô hình hóa bài toán: Không gian trạng thái
"Mỗi trạng thái được biểu diễn bởi bộ 4 giá trị nhị phân $(F,W,G,C)$, trong đó 0 là bờ trái và 1 là bờ phải."

"Trạng thái bắt đầu là $(0,0,0,0)$, trạng thái đích là $(1,1,1,1)$. Tổng cộng có 16 trạng thái lý thuyết."

"Sau khi áp ràng buộc an toàn, chỉ còn 10 trạng thái hợp lệ để đưa vào quá trình tìm kiếm."

"Ở phần hình minh họa, nhóm dùng khối hợp lệ và khối bị loại để nhấn mạnh việc cắt tỉa trạng thái ngay từ đầu."

---

## Slide 5 - Mô hình hóa bài toán: Hành động và ràng buộc
"Tập hành động có 8 phép chuyển: nông dân đi một mình hoặc đi cùng một đối tượng, theo hai chiều qua sông."

"Mỗi hành động đều có điều kiện khả dụng, ví dụ F + G sang phải chỉ hợp lệ khi F và G cùng đang ở bờ trái."

"Sau mỗi bước chuyển, hệ thống kiểm tra hai điều kiện loại:"

"Điều kiện 1: $W=G$ và $F\neq W$ thì Sói ăn Dê."

"Điều kiện 2: $G=C$ và $F\neq G$ thì Dê ăn Bắp cải."

"Nhờ cơ chế này, cây tìm kiếm chỉ mở rộng trên các nút hợp lệ, giúp giảm đáng kể nhánh thừa."

---

## Slide 6 - Hàm heuristic đề xuất
"Nhóm đề xuất hai heuristic. Heuristic thứ nhất là $h_1(s)$, đếm số đối tượng chưa sang bờ đích:"

"$h_1(s)=(1-W)+(1-G)+(1-C)$."

"$h_1$ đơn giản, tính nhanh, admissible, nhưng mức phân biệt trạng thái còn thấp."

"Heuristic thứ hai là $h_2(s)$, ước lượng số chuyến tối thiểu còn lại, có xét vị trí hiện tại của nông dân."

"Gọi $k=h_1(s)$. Nếu F ở trái thì dùng dạng $2k-1$, nếu F ở phải thì dùng dạng $2k+1$, và có xử lý riêng khi $k=0$."

"$h_2$ vừa admissible vừa consistent nên phù hợp cho A* và IDA*. Thực nghiệm cho thấy $h_2$ dẫn hướng tốt hơn $h_1$, giảm số node mở rộng."

---

## Slide 7 - Giới thiệu giải thuật sử dụng
"Nhóm triển khai 4 thuật toán: BFS, DFS, A* và IDA*."

"BFS và DFS là baseline không heuristic. A* và IDA* dùng hàm đánh giá $f(s)=g(s)+h(s)$ với $h_2$."

"BFS mạnh về tối ưu số bước nhưng tốn bộ nhớ. DFS tiết kiệm bộ nhớ hơn nhưng không đảm bảo tối ưu. A* cho chất lượng tìm kiếm tốt, IDA* cân bằng giữa heuristic và bộ nhớ."

---

## Slide 8 - Thiết kế và cài đặt (kiến trúc)
"Hệ thống gồm 4 khối chính: giao diện người dùng, bộ giải thuật, module heuristic và bảng thống kê."

"Core solver đảm nhiệm sinh trạng thái và kiểm tra ràng buộc; heuristic module cung cấp giá trị $h(s)$ cho các thuật toán informed."

"UI được tách thành River Scene, State Tree và Pseudocode Panel để vừa trực quan trạng thái, vừa bám sát logic thuật toán."

---

## Slide 9 - Thiết kế và cài đặt (luồng chạy)
"Luồng chạy gồm: chọn thuật toán, chọn heuristic, chọn chế độ Run hoặc Step, sau đó hệ thống sinh node và kiểm tra ràng buộc."

"Kết quả được cập nhật đồng thời vào cây trạng thái và bảng metrics."

"Chế độ step-by-step là điểm mạnh cho giảng dạy vì cho phép quan sát từng quyết định mở rộng node."

---

## Slide 10 - Kết quả
"Kết quả đạt được là cài đặt thành công cả 4 thuật toán và đều tìm ra lời giải hợp lệ."

"Khi so sánh tương đối, A* và IDA* có xu hướng mở rộng ít node hơn nhờ heuristic định hướng."

"Biểu đồ trong slide thể hiện xu hướng tiêu tốn tương đối giữa các thuật toán, phục vụ mục tiêu so sánh trực quan."

---

## Slide 11 - Kết quả (giao diện trực quan)
"Đây là dashboard của hệ thống: bên trái là Control Panel, giữa là River Scene, bên phải là State Tree, và phía dưới là Metrics."

"Bố cục này giúp người học nhìn được đồng thời ba lớp thông tin: trạng thái hiện tại, tiến trình tìm kiếm và hiệu năng thuật toán."

"Nhờ vậy công cụ phù hợp cho cả học tập trên lớp lẫn demo báo cáo."

---

## Slide 12 - Kết luận và hướng phát triển
"Nhóm đã mô hình hóa thành công bài toán qua sông dưới dạng state-space search, xây dựng tập trạng thái hợp lệ, và cài đặt đầy đủ 4 thuật toán tiêu biểu."

"Đóng góp chính là kết hợp giữa tính đúng đắn của mô hình và trực quan hóa quá trình giải."

"Hướng phát triển tiếp theo: mở rộng số đối tượng, bổ sung ràng buộc động, benchmark theo lô và nâng cấp animation thuyền."

---

## Slide 13 - Cảm ơn
"Nhóm 11 xin cảm ơn thầy và các bạn đã lắng nghe. Nhóm sẵn sàng nhận góp ý và trả lời câu hỏi."

---

## Gợi ý luyện nói nhanh
- Mỗi slide chỉ giữ 2 đến 3 ý, không đọc nguyên văn toàn bộ script.
- Nhấn mạnh các từ khóa: state space, trạng thái hợp lệ, hành động, ràng buộc, admissible, consistent.
- Nếu thiếu thời gian, rút ngắn Slide 8 và Slide 11; giữ đầy đủ Slide 4, Slide 5, Slide 6 vì đây là trọng tâm mới.
