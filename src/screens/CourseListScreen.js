import React, { useState, useCallback, useLayoutEffect } from 'react';
import {
  View, Text, FlatList, Image, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getCourses, getCategories } from '../api';
import { colors, formatPrice } from '../utils';

export default function CourseListScreen({ navigation }) {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [c, cat] = await Promise.all([getCourses(), getCategories()]);
      setCourses(c);
      setCategories(cat);
    } catch (e) {
      setError('Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng và thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Tự tải lại mỗi khi quay về màn hình này (sau thêm/sửa/xóa)
  useFocusEffect(useCallback(() => { loadData(); }, []));

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('Category')}>
            <Text style={styles.headerBtnText}>Danh mục</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('CourseForm')}>
            <Text style={styles.headerBtnText}>＋ Thêm</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  const getCatName = (id) => categories.find((c) => c.id === id)?.name || 'Chưa phân loại';

  const filtered = courses.filter(
    (c) =>
      c.title?.toLowerCase().includes(search.toLowerCase()) &&
      (!selectedCat || c.categoryId === selectedCat)
  );

  if (loading && courses.length === 0 && !error) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />;
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retry} onPress={loadData}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Text style={{ fontSize: 16 }}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo tên khóa học..."
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={{ height: 46 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.chip, !selectedCat && styles.chipActive]}
            onPress={() => setSelectedCat(null)}>
            <Text style={[styles.chipText, !selectedCat && styles.chipTextActive]}>Tất cả</Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, selectedCat === cat.id && styles.chipActive]}
              onPress={() => setSelectedCat(cat.id)}>
              <Text style={[styles.chipText, selectedCat === cat.id && styles.chipTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Text style={styles.count}>{filtered.length} khóa học</Text>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={loadData}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ fontSize: 40 }}>📭</Text>
            <Text style={styles.empty}>Không có khóa học nào</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('CourseDetail', { id: item.id })}>
            <Image source={{ uri: item.thumbnail }} style={styles.thumb} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{getCatName(item.categoryId)}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.instructor}>👨‍🏫 {item.instructor}</Text>
              <View style={styles.footer}>
                <Text style={styles.duration}>⏱ {item.duration} giờ</Text>
                <Text style={styles.price}>{formatPrice(item.price)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 14, paddingTop: 12, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  errorText: { marginBottom: 12, color: colors.text, textAlign: 'center' },
  retry: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  headerBtn: {
    marginLeft: 8, paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8,
  },
  headerBtnText: { color: '#fff', fontWeight: '600' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    paddingHorizontal: 12, borderRadius: 12, marginBottom: 10,
    borderWidth: 1, borderColor: colors.border,
  },
  searchInput: { flex: 1, paddingVertical: 11, paddingLeft: 8, color: colors.text },
  chip: {
    paddingHorizontal: 16, justifyContent: 'center', backgroundColor: '#fff',
    borderRadius: 20, marginRight: 8, height: 36, borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  count: { color: colors.muted, marginVertical: 8 },
  card: {
    backgroundColor: colors.card, borderRadius: 16, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  thumb: {
    width: '100%', height: 170, borderTopLeftRadius: 16, borderTopRightRadius: 16,
    backgroundColor: '#ddd',
  },
  badge: {
    position: 'absolute', top: 12, left: 12, backgroundColor: colors.primary,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  cardBody: { padding: 14 },
  title: { fontSize: 17, fontWeight: 'bold', color: colors.text },
  instructor: { color: colors.muted, marginTop: 6 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  duration: { color: colors.muted },
  price: { fontSize: 18, fontWeight: 'bold', color: colors.price },
  empty: { textAlign: 'center', marginTop: 8, color: colors.muted },
});
