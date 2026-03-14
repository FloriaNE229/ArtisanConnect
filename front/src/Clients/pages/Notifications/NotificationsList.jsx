import { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCircle, X, Calendar, FileText, Star, Clock, Trash2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { notificationAPI } from '../../../../services/api';

export default function NotificationsList() {
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [filter,        setFilter]        = useState('all');
  const [unreadCount,   setUnreadCount]   = useState(0);

  // ── GET /notifications ─────────────────────────────────────
const fetchNotifications = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const data = await notificationAPI.index();

    // Récupérer la liste réelle
    const raw = data.notifications ?? data.data ?? [];
    const list = Array.isArray(raw) ? raw : raw.data ?? [];

    const filtered = filter === 'all'
      ? list
      : list.filter(n => filter === 'unread' ? !n.lu && !n.read : n.lu || n.read);

    setNotifications(filtered);
    setUnreadCount(data.unread_count ?? list.filter(n => !n.lu && !n.read).length);
  } catch (err) {
    setError(err.message || 'Erreur lors du chargement.');
  } finally {
    setLoading(false);
  }
}, [filter]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // ── PATCH /notifications/:id/lu ───────────────────────────
  const handleMarkAsRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: true, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await notificationAPI.marquerLue(id);
    } catch {
      fetchNotifications();
    }
  };

  // ── PATCH /notifications/lire-tout ────────────────────────
  const handleMarkAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, lu: true, read: true })));
    setUnreadCount(0);
    try {
      await notificationAPI.marquerToutesLues();
    } catch {
      fetchNotifications();
    }
  };

  // ── DELETE /notifications/:id ──────────────────────────────
  const handleDelete = async (id) => {
    const deleted = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (deleted && !deleted.lu && !deleted.read) setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await notificationAPI.destroy(id);
    } catch {
      fetchNotifications();
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      service_accepted:      { Icon: CheckCircle, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)'  },
      service_refused:       { Icon: X,           color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)'  },
      appointment_confirmed: { Icon: Calendar,    color: '#4a6fa5', bg: 'rgba(74, 111, 165, 0.1)' },
      appointment_cancelled: { Icon: X,           color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)'  },
      new_message:           { Icon: FileText,    color: '#ff7e5f', bg: 'rgba(255, 126, 95, 0.1)' },
      review_request:        { Icon: Star,        color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)' },
      service_completed:     { Icon: CheckCircle, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)'  },
      reminder:              { Icon: Clock,       color: '#fb923c', bg: 'rgba(251, 146, 60, 0.1)' },
    };
    return icons[type] ?? icons.new_message;
  };

  return (
    <div className="min-h-screen pt-24 pb-20" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-xs font-semibold rounded-full"
            style={{ backgroundColor: 'rgba(74, 111, 165, 0.1)', color: '#4a6fa5' }}>
            <Bell className="w-4 h-4" />
            {unreadCount > 0 ? `${unreadCount} non lu${unreadCount > 1 ? 's' : ''}` : 'Toutes lues'}
          </div>
          <h1 className="mb-3 text-3xl font-black md:text-4xl" style={{ color: '#2b2d42' }}>
            Mes{' '}
            <span className="text-transparent bg-clip-text"
              style={{ background: 'linear-gradient(90deg, #4a6fa5, #7aa0d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              notifications
            </span>
          </h1>
          <p className="text-sm text-gray-600">Restez informé de toutes vos activités</p>
        </div>

        {/* Filtres */}
        <div className="p-5 mb-6 bg-white shadow-sm rounded-xl">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all',    label: 'Toutes'   },
                { value: 'unread', label: 'Non lues' },
                { value: 'read',   label: 'Lues'     },
              ].map(f => (
                <button key={f.value} onClick={() => setFilter(f.value)}
                  className="px-4 py-2 text-sm font-bold transition-all border-2 rounded-lg"
                  style={{
                    backgroundColor: filter === f.value ? '#4a6fa5' : 'white',
                    color:           filter === f.value ? 'white'   : '#2b2d42',
                    borderColor:     filter === f.value ? '#4a6fa5' : '#e5e7eb',
                  }}>
                  {f.label}
                </button>
              ))}
            </div>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 transition-all border-2 border-gray-200 rounded-lg hover:border-gray-300">
                <CheckCircle className="w-4 h-4" /> Tout marquer lu
              </button>
            )}
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div className="p-6 mb-6 text-center bg-white shadow-sm rounded-xl">
            <AlertCircle className="w-10 h-10 mx-auto mb-3" style={{ color: '#ef4444' }} />
            <p className="mb-4 font-semibold text-red-600">⚠️ {error}</p>
            <button onClick={fetchNotifications}
              className="px-6 py-2 text-sm font-bold text-white rounded-lg"
              style={{ backgroundColor: '#4a6fa5' }}>
              Réessayer
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
          </div>
        ) : !error && notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map(notification => {
              const { Icon, color, bg } = getNotificationIcon(notification.type);
              const isUnread = !notification.lu && !notification.read;
              return (
                <div key={notification.id}
                  className={`p-5 bg-white shadow-sm transition-all rounded-xl ${isUnread ? 'border-l-4' : ''}`}
                  style={{ borderLeftColor: isUnread ? color : 'transparent' }}>

                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-full"
                      style={{ backgroundColor: bg }}>
                      <Icon className="w-6 h-6" style={{ color }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className="mb-1 font-bold" style={{ color: '#2b2d42' }}>
                            {notification.title ?? notification.titre}
                          </h3>
                          <p className="text-sm leading-relaxed text-gray-600">
                            {notification.message ?? notification.contenu}
                          </p>
                        </div>
                        {isUnread && (
                          <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full"
                            style={{ backgroundColor: color }} />
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {notification.time ?? (notification.created_at
                            ? new Date(notification.created_at).toLocaleString('fr-FR')
                            : '—')}
                        </div>

                        <div className="flex gap-2">
                          {notification.link && (
                            <Link to={notification.link}>
                              <button className="px-3 py-1 text-xs font-bold text-gray-700 transition-all border-2 border-gray-200 rounded-lg hover:border-gray-300">
                                Voir
                              </button>
                            </Link>
                          )}
                          {isUnread && (
                            <button onClick={() => handleMarkAsRead(notification.id)}
                              className="px-3 py-1 text-xs font-bold text-gray-700 transition-all bg-gray-100 rounded-lg hover:bg-gray-200">
                              Marquer lu
                            </button>
                          )}
                          <button onClick={() => handleDelete(notification.id)}
                            className="px-3 py-1 text-xs font-bold text-red-500 transition-all rounded-lg bg-red-50 hover:bg-red-100">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : !error && (
          <div className="py-20 text-center bg-white shadow-sm rounded-xl">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full"
              style={{ backgroundColor: 'rgba(74, 111, 165, 0.1)' }}>
              <Bell className="w-10 h-10" style={{ color: '#4a6fa5' }} />
            </div>
            <h3 className="mb-3 text-2xl font-bold" style={{ color: '#2b2d42' }}>Aucune notification</h3>
            <p className="text-sm text-gray-600">Vous n'avez pas encore de notifications</p>
          </div>
        )}
      </div>
    </div>
  );
}