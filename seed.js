// Chạy bằng:  node seed.js   (cần Node 18 trở lên)
// Script XÓA toàn bộ dữ liệu cũ của categories và courses rồi nạp dữ liệu mới.

const BASE_URL = 'https://6ad739fb95e98f36aef20eca.mockapi.io'; // đổi nếu bạn dùng /api/v1

const call = async (method, path, body) => {
  const res = await fetch(BASE_URL + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}`);
  return res.json();
};

const getAll = async (path) => {
  try { return await call('GET', path); } catch { return []; }
};

const V = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/';
const img = (seed) => `https://picsum.photos/seed/${seed}/800/450`;

const categories = [
  { name: 'Lập trình Mobile', description: 'Android, Flutter, React Native, iOS' },
  { name: 'Lập trình Web', description: 'Frontend và Backend' },
  { name: 'Trí tuệ nhân tạo', description: 'AI, Machine Learning, Deep Learning' },
];

// cat: vị trí danh mục trong mảng categories ở trên
const courses = [
  { cat: 0, title: 'Lập trình Android cơ bản với Kotlin', instructor: 'Nguyễn Văn An', price: 599000, duration: 30, seed: 'android-kotlin', video: 'ForBiggerBlazes.mp4',
    description: 'Làm quen Android Studio, xây dựng giao diện với XML, xử lý sự kiện, RecyclerView và gọi REST API. Kết thúc khóa học bạn tự làm được một ứng dụng hoàn chỉnh.' },
  { cat: 0, title: 'Flutter từ cơ bản đến nâng cao', instructor: 'Trần Minh Khoa', price: 890000, duration: 42, seed: 'flutter-dart', video: 'ForBiggerEscapes.mp4',
    description: 'Học Dart, widget, quản lý state với Provider, điều hướng, lưu trữ dữ liệu và xây dựng app đa nền tảng chỉ với một codebase.' },
  { cat: 0, title: 'React Native thực chiến: Xây dựng app bán hàng', instructor: 'Lê Hoàng Nam', price: 990000, duration: 38, seed: 'react-native-shop', video: 'ForBiggerFun.mp4',
    description: 'Xây dựng ứng dụng bán hàng từ A đến Z: danh sách sản phẩm, giỏ hàng, đăng nhập, gọi API và xuất bản ứng dụng với Expo.' },
  { cat: 0, title: 'Lập trình iOS với Swift và SwiftUI', instructor: 'Phạm Quốc Bảo', price: 1190000, duration: 45, seed: 'ios-swift', video: 'ForBiggerJoyrides.mp4',
    description: 'Nắm vững Swift, SwiftUI, Combine và Core Data. Thực hành qua 3 dự án thực tế và hướng dẫn đưa app lên App Store.' },
  { cat: 1, title: 'HTML, CSS, JavaScript cho người mới bắt đầu', instructor: 'Đỗ Thu Hà', price: 399000, duration: 25, seed: 'web-basic', video: 'ForBiggerMeltdowns.mp4',
    description: 'Khóa học nền tảng giúp bạn xây dựng trang web đầu tiên: bố cục responsive, Flexbox, Grid, DOM và xử lý sự kiện với JavaScript.' },
  { cat: 1, title: 'ReactJS toàn tập', instructor: 'Vũ Đức Anh', price: 790000, duration: 36, seed: 'reactjs', video: 'SubaruOutbackOnStreetAndDirt.mp4',
    description: 'Component, hooks, React Router, quản lý state với Redux Toolkit và tối ưu hiệu năng. Có dự án cuối khóa là trang quản trị.' },
  { cat: 1, title: 'Node.js và Express: Xây dựng REST API', instructor: 'Hoàng Thị Lan', price: 690000, duration: 28, seed: 'nodejs-api', video: 'BigBuckBunny.mp4',
    description: 'Thiết kế REST API chuẩn với Express, kết nối MongoDB, xác thực JWT, upload file và triển khai lên server.' },
  { cat: 2, title: 'Nhập môn Trí tuệ nhân tạo', instructor: 'Nguyễn Thanh Tùng', price: 890000, duration: 32, seed: 'ai-intro', video: 'ElephantsDream.mp4',
    description: 'Tổng quan AI, thuật toán tìm kiếm, biểu diễn tri thức và các ứng dụng AI thực tế. Phù hợp cho người mới bắt đầu.' },
  { cat: 2, title: 'Machine Learning với Python', instructor: 'Bùi Quang Huy', price: 1290000, duration: 50, seed: 'ml-python', video: 'Sintel.mp4',
    description: 'Hồi quy, phân loại, phân cụm, đánh giá mô hình với scikit-learn. Thực hành trên các bộ dữ liệu thực tế.' },
  { cat: 2, title: 'Deep Learning và xử lý ảnh với PyTorch', instructor: 'Ngô Minh Châu', price: 1590000, duration: 55, seed: 'deep-learning', video: 'TearsOfSteel.mp4',
    description: 'Mạng nơ-ron, CNN, nhận diện đối tượng và chuyển giao học tập. Xây dựng mô hình nhận diện ảnh hoàn chỉnh bằng PyTorch.' },
];

(async () => {
  try {
    console.log('Xóa dữ liệu cũ...');
    for (const c of await getAll('/courses')) await call('DELETE', `/courses/${c.id}`);
    for (const c of await getAll('/categories')) await call('DELETE', `/categories/${c.id}`);

    console.log('Thêm danh mục...');
    const created = [];
    for (const c of categories) created.push(await call('POST', '/categories', c));

    console.log('Thêm khóa học...');
    let day = 1;
    for (const c of courses) {
      await call('POST', '/courses', {
        title: c.title,
        description: c.description,
        categoryId: created[c.cat].id,
        instructor: c.instructor,
        price: c.price,
        duration: c.duration,
        thumbnail: img(c.seed),
        trailerUrl: V + c.video,
        createdAt: `2026-10-${String(day++).padStart(2, '0')}`,
      });
    }
    console.log('Xong! Đã có 3 danh mục và 10 khóa học.');
  } catch (e) {
    console.error('Lỗi:', e.message);
  }
})();