import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { mockTasks, mockCleaners } from '../../../mock/data';

export default function UserHomeScreen() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState(mockTasks);
  const [cleaners, setCleaners] = useState(mockCleaners);

  return (
    <ScrollView style={styles.container}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Welcome, {user?.name}</Text>
        <Text style={styles.subtext}>Find cleaning services near you</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton}>
          <View style={[styles.actionIcon, { backgroundColor: '#ef4444' }]}>
            <Text style={styles.actionIconText}>+</Text>
          </View>
          <Text style={styles.actionText}>Post Task</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <View style={[styles.actionIcon, { backgroundColor: '#3b82f6' }]}>
            <Text style={styles.actionIconText}>🔍</Text>
          </View>
          <Text style={styles.actionText}>Find Cleaners</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <View style={[styles.actionIcon, { backgroundColor: '#10b981' }]}>
            <Text style={styles.actionIconText}>📋</Text>
          </View>
          <Text style={styles.actionText}>My Tasks</Text>
        </TouchableOpacity>
      </View>

      {/* Featured Cleaners */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Cleaners</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {cleaners.map((cleaner) => (
            <TouchableOpacity key={cleaner.id} style={styles.cleanerCard}>
              <Image source={{ uri: cleaner.avatar }} style={styles.cleanerAvatar} />
              <Text style={styles.cleanerName}>{cleaner.name}</Text>
              <Text style={styles.cleanerRating}>⭐ {cleaner.rating} ({cleaner.reviews})</Text>
              <Text style={styles.cleanerServices}>
                {cleaner.serviceTypes.join(', ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Recent Tasks */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Tasks</Text>
        {tasks.map((task) => (
          <TouchableOpacity key={task.id} style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
                <Text style={styles.statusText}>{task.status}</Text>
              </View>
            </View>
            <Text style={styles.taskDescription}>{task.description}</Text>
            <View style={styles.taskFooter}>
              <Text style={styles.taskLocation}>{task.location}</Text>
              <Text style={styles.taskBudget}>₱{task.budget}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return '#f59e0b';
    case 'accepted':
      return '#3b82f6';
    case 'in_progress':
      return '#10b981';
    case 'completed':
      return '#059669';
    case 'cancelled':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  welcomeSection: {
    padding: 20,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 16,
    color: '#e0f2fe',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIconText: {
    fontSize: 24,
    color: '#fff',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  cleanerCard: {
    width: 160,
    marginRight: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cleanerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  cleanerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cleanerRating: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cleanerServices: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  taskCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskLocation: {
    fontSize: 14,
    color: '#666',
  },
  taskBudget: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
});