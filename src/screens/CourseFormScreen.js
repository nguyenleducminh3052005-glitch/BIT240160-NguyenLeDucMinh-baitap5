import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Image, ScrollView, TouchableOpacity,
  ActivityIndicator, StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getCategories, addCourse, updateCourse } from '../api';
import { colors, notify } from '../utils';

export default function CourseFormScreen({ route, navigation }) {
  // Có route.params.course => đang SỬA, không có => đang THÊM
  const editing = route.params?.course;

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState(editing?.title || '');
  const [description, setDescription] = useState(editing?.description || '');
  const [instructor, setInstructor] = useState(editing?.instructor || '');
  const [price, setPrice] = useState(editing ? String(editing.price) : '');
  const [duration, setDuration] = useState(editing ? String(editing.duration) : '');
  const [thumbnail, setThumbnail] = useState(editing?.thumbnail || '');
  const [trailerUrl, setTrailerUrl] = useState(editing?.trailerUrl || '');
  const [categoryId, setCategoryId] = useState(editing?.categoryId || '');

  useEffect(() => {
    navigation.setOptions({ title: editing ? 'Sửa khóa học' : 'Thêm khóa học' });
    (async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
        if (!editing && cats.length > 0) setCategoryId(cats[0].id);
      } catch (e) {
        notify('Lỗi', 'Không tải được danh mục. Vui lòng kiểm tra kết nối.');
      } finally {
        setLoadingCats(false);
      }
    })();
  }, []);

  const validate = () => {
    if (!title.trim()) return 'Vui lòng nhập tên khóa học';
    if (!description.trim()) return 'Vui lòng nhập mô tả';
    if (!instructor.trim()) return 'Vui lòng nhập tên giảng viên';
    if (price.trim() === '' || isNaN(Number(price))) return 'Học phí phải là số';
    if (Number(price) < 0) return 'Học phí không được âm';
    if (duration.trim() === '' || isNaN(Number(duration)) || Number(duration) <= 0)
      return 'Thời lượng phải là số lớn hơn 0';
    if (!thumbnail.trim()) return 'Vui lòng nhập URL ảnh bìa';
    if (!trailerUrl.trim()) return 'Vui lòng nhập URL trailer';
    if (!categories.some((c) => c.id === categoryId)) return 'Danh mục không tồn tại';
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) {
      notify('Dữ liệu chưa hợp lệ', err);
      return;
    }
    const data = {
      title: title.trim(),
      description: description.trim(),
      instructor: instructor.trim(),
      price: Number(price),
      duration: Number(duration),
      thumbnail: thumbnail.trim(),
      trailerUrl: trailerUrl.trim(),
      categoryId,
    };
    try {
      setSaving(true);
      if (editing) {
        await updateCourse(editing.id, data);
      } else {
        await addCourse({ ...data, createdAt: new Date().toISOString().slice(0, 10) });
      }
      notify('Thành công', editing ? 'Đã cập nhật khóa học' : 'Đã thêm khóa học');
      navigation.goBack();
    } catch (e) {
      notify('Lỗi', 'Không lưu được, vui lòng kiểm tra kết nối.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingCats) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />;
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Tên khóa học *</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Mô tả *</Text>
      <TextInput
        style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Danh mục *</Text>
      <View style={styles.pickerBox}>
        <Picker selectedValue={categoryId} onValueChange={setCategoryId}>
          {categories.map((c) => (
            <Picker.Item key={c.id} label={c.name} value={c.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Giảng viên *</Text>
      <TextInput style={styles.input} value={instructor} onChangeText={setInstructor} />

      <Text style={styles.label}>Học phí (VNĐ) *</Text>
      <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" />

      <Text style={styles.label}>Thời lượng (giờ) *</Text>
      <TextInput style={styles.input} value={duration} onChangeText={setDuration} keyboardType="numeric" />

      <Text style={styles.label}>URL ảnh bìa *</Text>
      <TextInput
        style={styles.input}
        value={thumbnail}
        onChangeText={setThumbnail}
        autoCapitalize="none"
        placeholder="https://..."
      />
      {thumbnail.trim() !== '' && (
        <Image source={{ uri: thumbnail.trim() }} style={styles.preview} resizeMode="cover" />
      )}

      <Text style={styles.label}>URL trailer (.mp4) *</Text>
      <TextInput
        style={styles.input}
        value={trailerUrl}
        onChangeText={setTrailerUrl}
        autoCapitalize="none"
        placeholder="https://....mp4"
      />

      <TouchableOpacity
        style={[styles.btn, saving && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={saving}>
        <Text style={styles.btnText}>{saving ? 'Đang lưu...' : 'Lưu khóa học'}</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.bg },
  label: { fontWeight: '600', marginTop: 14, marginBottom: 6, color: colors.text },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, padding: 12, color: colors.text,
  },
  pickerBox: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 12,
  },
  preview: { width: '100%', height: 180, marginTop: 10, borderRadius: 12, backgroundColor: '#eee' },
  btn: {
    backgroundColor: colors.primary, padding: 15, borderRadius: 12,
    alignItems: 'center', marginTop: 24,
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
