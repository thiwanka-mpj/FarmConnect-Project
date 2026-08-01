import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { toast } from 'react-toastify';
import '../../styles/AdminTables.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await adminService.getAllUsers(token);
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId, userName, userRole) => {
    if (userRole === 'ADMIN') {
      toast.error('Cannot delete admin users');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${userName}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await adminService.deleteUser(userId, token);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data || 'Failed to delete user');
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      ADMIN: '#6f42c1',
      CUSTOMER: '#17a2b8',
      FARMER: '#52b788',
      RIDER: '#fd7e14',
    };
    return colors[role] || '#6c757d';
  };

  const filteredUsers = users.filter((user) => {
    const matchesRole = filter === 'ALL' || user.role === filter;
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <h2>Loading users...</h2>
      </div>
    );
  }

  return (
    <div className="admin-table-container">
      <div className="admin-table-header">
        <h1>User Management</h1>

        <div className="admin-filters">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-search"
          />

          <div className="admin-role-filters">
            {['ALL', 'CUSTOMER', 'FARMER', 'RIDER', 'ADMIN'].map((role) => (
              <button
                key={role}
                className={`admin-filter-button ${
                  filter === role ? 'active' : ''
                }`}
                onClick={() => setFilter(role)}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.userId}>
                <td>{user.userId}</td>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>
                  <span
                    className="role-badge"
                    style={{ backgroundColor: getRoleBadgeColor(user.role) }}
                  >
                    {user.role}
                  </span>
                </td>
                <td>{user.phoneNumber || 'N/A'}</td>
                <td className="address-cell">{user.address || 'N/A'}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  {user.role !== 'ADMIN' && (
                    <button
                      className="delete-button"
                      onClick={() =>
                        handleDelete(user.userId, user.fullName, user.role)
                      }
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="no-data">
          <p>No users found</p>
        </div>
      )}

      <div className="table-summary">
        <p>
          Showing {filteredUsers.length} of {users.length} users
        </p>
      </div>
    </div>
  );
};

export default UserManagement;