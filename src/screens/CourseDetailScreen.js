import React, { useState, useCallback } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  ActivityIndicator, StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';
import { getCourse, getCategories, deleteCourse } from '../api';
import { colors, formatPrice, notify, confirmDialog } from '../utils';

// Chỉ được tạo khi bấm "Xem trailer"
function TrailerPlayer({ url }) {
  const player = useVideoPlayer(url, (p) => {
    p.loop = false;
    p.play();
  });
  return <VideoView player={player} style={styles.video} allowsFullscreen nativeControls />;
}

export default function CourseDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const insets = useSafeAreaInsets();
  const [course, setCourse] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [c, cats] = await Promise.all([getCourse(id), getCategories()]);
      setCourse(c);
      setCategoryName(cats.find((x) => x.id === c.categoryId)?.name || 'Chưa phân loại');
    } catch (e) {
      setError('Không tải được dữ liệu khóa học.');
    } finally {
      setLoading(false);
    }
  };

  // Tải lại khi quay về từ màn sửa
  useFocusEffect(useCallback(() => { loadData(); }, [id]));

  const handleDelete = () => {
    confirmDialog('Xác nhận xóa', `Bạn có chắc muốn xóa "${course.title}"?`, async () => {
      try {
        await deleteCourse(id);
        notify('Thành công', 'Đã xóa khóa học');
        navigation.goBack();
      } catch (e) {
        notify('Lỗi', 'Không xóa được, vui lòng thử lại.');
      }
    });
  };

  const handleTrailer = () => {
    if (!course.trailerUrl) {
      notify('Thông báo', 'Khóa học này chưa có trailer');
      return;
    }
    setShowTrailer(!showTrailer);
  };

  if (loading && !course) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />;
  }

  if (error || !course) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 12 }}>{error || 'Không tìm thấy khóa học'}</Text>
        <TouchableOpacity style={styles.retry} onPress={loadData}>
          <Text style={styles.btnText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        <Image source={{ uri: course.thumbnail }} style={styles.cover} />

        <View style={styles.content}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{categoryName}</Text>
          </View>
          <Text style={styles.title}>{course.title}</Text>
          <Text style={styles.price}>{formatPrice(course.price)}</Text>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statIcon}>👨‍🏫</Text>
              <Text style={styles.statValue} numberOfLines={1}>{course.instructor}</Text>
              <Text style={styles.statLabel}>Giảng viên</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statIcon}>⏱</Text>
              <Text style={styles.statValue}>{course.duration} giờ</Text>
              <Text style={styles.statLabel}>Thời lượng</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statIcon}>📅</Text>
              <Text style={styles.statValue}>{course.createdAt}</Text>
              <Text style={styles.statLabel}>Ngày tạo</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Giới thiệu khóa học</Text>
          <Text style={styles.desc}>{course.description}</Text>

          <Text style={styles.sectionTitle}>Video giới thiệu</Text>
          {showTrailer && course.trailerUrl ? <TrailerPlayer url={course.trailerUrl} /> : null}
          <TouchableOpacity style={styles.trailerBtn} onPress={handleTrailer}>
            <Text style={styles.trailerText}>{showTrailer ? '⏹ Ẩn trailer' : '▶ Xem trailer'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Thanh nút cố định ở đáy màn hình */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.warning }]}
          onPress={() => navigation.navigate('CourseForm', { course })}>
          <Text style={styles.btnText}>✏️ Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.danger }]}
          onPress={handleDelete}>
          <Text style={styles.btnText}>🗑 Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  retry: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  cover: { width: '100%', height: 240, backgroundColor: '#ddd' },
  content: {
    backgroundColor: colors.bg, marginTop: -24, borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 18,
  },
  badge: {
    alignSelf: 'flex-start', backgroundColor: colors.primary,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14,
  },
  badgeText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginTop: 10 },
  price: { fontSize: 24, fontWeight: 'bold', color: colors.price, marginTop: 8 },
  stats: { flexDirection: 'row', marginTop: 16 },
  stat: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 10,
    alignItems: 'center', marginHorizontal: 4,
  },
  statIcon: { fontSize: 22 },
  statValue: { fontWeight: 'bold', color: colors.text, marginTop: 4, fontSize: 13 },
  statLabel: { color: colors.muted, fontSize: 11, marginTop: 2 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: colors.text, marginTop: 20, marginBottom: 6 },
  desc: { color: '#374151', lineHeight: 22 },
  video: { width: '100%', height: 210, borderRadius: 12, backgroundColor: '#000', marginBottom: 10 },
  trailerBtn: {
    borderWidth: 2, borderColor: colors.primary, padding: 12,
    borderRadius: 12, alignItems: 'center', marginTop: 4,
  },
  trailerText: { color: colors.primary, fontWeight: 'bold' },
  bottomBar: {
    flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.border,
  },
  actionBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', marginHorizontal: 5 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
