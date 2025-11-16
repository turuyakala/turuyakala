'use client';

import { useEffect, useState } from 'react';

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  adminReply: string | null;
  repliedAt: string | null;
  repliedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function ContactMessagesAdminPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/admin/contact-messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReply = async (messageId: string) => {
    if (!replyText.trim()) return;

    setIsReplying(true);
    try {
      const response = await fetch(`/api/admin/contact-messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'replied',
          adminReply: replyText.trim(),
        }),
      });

      if (response.ok) {
        setReplyText('');
        setSelectedMessage(null);
        fetchMessages(); // Refresh messages
      }
    } catch (error) {
      console.error('Error replying to message:', error);
    } finally {
      setIsReplying(false);
    }
  };

  const handleStatusChange = async (messageId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/contact-messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (response.ok) {
        fetchMessages(); // Refresh messages
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm('Bu mesajı silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/admin/contact-messages/${messageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchMessages(); // Refresh messages
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-yellow-100 text-yellow-800';
      case 'read':
        return 'bg-blue-100 text-blue-800';
      case 'replied':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new':
        return 'Yeni';
      case 'read':
        return 'Okundu';
      case 'replied':
        return 'Yanıtlandı';
      case 'closed':
        return 'Kapatıldı';
      default:
        return status;
    }
  };

  const newMessages = messages.filter(m => m.status === 'new');
  const totalMessages = messages.length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">📧 İletişim Mesajları</h1>
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📧 İletişim Mesajları</h1>
          <p className="text-gray-600 mt-1">
            Müşteri mesajlarını yönetin ve yanıtlayın
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="text-yellow-600 font-semibold mb-1">Yeni Mesajlar</div>
          <div className="text-3xl font-bold text-yellow-900">{newMessages.length}</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="text-blue-600 font-semibold mb-1">Toplam Mesaj</div>
          <div className="text-3xl font-bold text-blue-900">{totalMessages}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="text-green-600 font-semibold mb-1">Yanıtlanan</div>
          <div className="text-3xl font-bold text-green-900">
            {messages.filter(m => m.status === 'replied').length}
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gönderen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Konu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {messages.map((message) => (
                <tr key={message.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(message.status)}`}>
                      {getStatusLabel(message.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{message.name}</div>
                      <div className="text-sm text-gray-500">{message.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{message.subject}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(message.createdAt).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setSelectedMessage(message)}
                      className="text-secondary hover:text-secondary/80"
                    >
                      👁️ Görüntüle
                    </button>
                    {message.status === 'new' && (
                      <button
                        onClick={() => handleStatusChange(message.id, 'read')}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ✓ Okundu
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(message.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑️ Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Mesaj Detayı</h3>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gönderen</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {selectedMessage.name} ({selectedMessage.email})
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Konu</label>
                  <div className="mt-1 text-sm text-gray-900">{selectedMessage.subject}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Mesaj</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm text-gray-900">
                    {selectedMessage.message}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tarih</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {new Date(selectedMessage.createdAt).toLocaleString('tr-TR')}
                  </div>
                </div>

                {selectedMessage.adminReply && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Admin Yanıtı</label>
                    <div className="mt-1 p-3 bg-green-50 rounded-md text-sm text-gray-900">
                      {selectedMessage.adminReply}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Yanıtlandı: {new Date(selectedMessage.repliedAt!).toLocaleString('tr-TR')}
                    </div>
                  </div>
                )}

                {!selectedMessage.adminReply && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Yanıt Yazın</label>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                      placeholder="Müşteriye yanıtınızı yazın..."
                    />
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleReply(selectedMessage.id)}
                        disabled={isReplying || !replyText.trim()}
                        className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isReplying ? 'Gönderiliyor...' : 'Yanıt Gönder'}
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedMessage.id, 'closed')}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                      >
                        Kapat
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
