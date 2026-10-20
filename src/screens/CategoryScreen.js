import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput, Modal,
  ActivityIndicator, StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getCategories, getCourses, addCategory, updateCategory, deleteCategory,
} from '../api';
import { colors, notify, confirmDialog } from '../utils';

export default function CategoryScreen() {
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null); // null = đang thêm mới
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [cats, crs] = await Promise.all([getCategories(), getCourses()]);
      setCategories(cats);
      setCourses(crs);
    } catch (e) {
      setError('Không thể kết nối tới máy chủ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const countCourses = (catId) => courses.filter((c) => c.categoryId === catId).length;

  const openAdd = () => {
    setEditing(null);
    setName('');
    setDescription('');
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setName(item.name);
    setDescription(item.description || '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      notify('Dữ liệu chưa hợp lệ', 'Vui lòng nhập tên danh mục');
      return;
    }
    const data = { name: name.trim(), description: description.trim() };
    try {
      setSaving(true);
      if (editing) await updateCategory(editing.id, data);
      else await addCategory(data);
      setModalVisible(false);
      await loadData();
    } catch (e) {
      notify('Lỗi', 'Không lưu được danh mục, vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item) => {
    const n = countCourses(item.id);
    // Ràng buộc: không cho xóa danh mục đang có khóa học
    if (n > 0) {
      notify('Không thể xóa', `Danh mục "${item.name}" đang có ${n} khóa học. Hãy xóa hoặc chuyển các khóa học sang danh mục khác trước.`);
      return;
    }
    confirmDialog('Xác nhận xóa', `Bạn có chắc muốn xóa danh mục "${item.name}"?`, async () => {
      try {
        await deleteCategory(item.id);
        await loadData();
      } catch (e) {
        notify('Lỗi', 'Không xóa được, vui lòng thử lại.');
      }
    });
  };

  if (loading && categories.length === 0 && !error) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />;
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 12 }}>{error}</Text>
        <TouchableOpacity style={styles.retry} onPress={loadData}>
          <Text style={styles.btnText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={loadData}
        contentContainerStyle={{ padding: 14, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ fontSize: 40 }}>📂</Text>
            <Text style={{ color: colors.muted, marginTop: 8 }}>Chưa có danh mục nào</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.desc}>{item.description}</Text>
              <Text style={styles.count}>{countCourses(item.id)} khóa học</Text>
            </View>
            <TouchableOpacity
              style={[styles.smallBtn, { backgroundColor: colors.warning }]}
              onPress={() => openEdit(item)}>
              <Text style={styles.smallBtnText}>Sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.smallBtn, { backgroundColor: colors.danger }]}
              onPress={() => handleDelete(item)}>
              <Text style={styles.smallBtnText}>Xóa</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.btnText}>＋ Thêm danh mục</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editing ? 'Sửa danh mục' : 'Thêm danh mục'}</Text>

            <Text style={styles.label}>Tên danh mục *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />

            <Text style={styles.label}>Mô tả</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <View style={{ flexDirection: 'row', marginTop: 18 }}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#E5E7EB', marginRight: 8 }]}
                onPress={() => setModalVisible(false)}>
                <Text style={{ fontWeight: 'bold', color: colors.text }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.primary }, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={saving}>
                <Text style={styles.btnText}>{saving ? 'Đang lưu...' : 'Lưu'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  retry: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 14, padding: 14, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  name: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  desc: { color: colors.muted, marginTop: 2 },
  count: { color: colors.primary, marginTop: 6, fontWeight: '600', fontSize: 12 },
  smallBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginLeft: 8 },
  smallBtnText: { color: '#fff', fontWeight: 'bold' },
  bottomBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 12,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.border,
  },
  addBtn: { backgroundColor: colors.primary, padding: 14, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 },
  modal: { backgroundColor: '#fff', borderRadius: 16, padding: 18 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  label: { fontWeight: '600', marginTop: 14, marginBottom: 6, color: colors.text },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, padding: 12, color: colors.text,
  },
  modalBtn: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
});
