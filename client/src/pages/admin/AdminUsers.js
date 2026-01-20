import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import PageLoader from '../../components/PageLoader';
import { ShieldCheck, Shield } from 'lucide-react';


const AdminUsers = () => {
  const [users,setUsers] = useState([]);
  const [loading,setLoading] = useState(true);
  const [page,setPage] = useState(1);
  const [pages,setPages] = useState(1);

  useEffect(()=>{ fetchUsers(); },[page]);

  const fetchUsers = async()=>{
    setLoading(true);
    try{
      const {data} = await axios.get(`/api/admin/users?page=${page}`);
      setUsers(data.users);
      setPages(data.totalPages);
    }catch(err){ toast.error('Failed to load users'); }
    finally{ setLoading(false); }
  };

  const toggleRole = async(id,currentRole)=>{
    const newRole = currentRole==='admin' ? 'user' : 'admin';
    try{
      await axios.put(`/api/admin/users/${id}/role`,{role:newRole});
      toast.success('Role updated');
      fetchUsers();
    }catch(err){ toast.error('Update failed'); }
  };



  return(
    <AdminLayout>
      <PageLoader loading={loading} text="Loading users...">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-black dark:text-white">Users</h1>

          <div className="bg-white shadow rounded overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td className="p-6" colSpan={4}>Loading…</td></tr>
                ):(
                  users.map(u=>(
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{u.name}</td>
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3 text-center">
                        {u.role==='admin' ? (
                          <span className="text-green-700 inline-flex items-center">
                            <ShieldCheck className="w-4 h-4 mr-1"/> Admin
                          </span>
                        ):(
                          <span className="text-gray-600">User</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          className="text-sm text-blue-600 hover:underline"
                          onClick={()=>toggleRole(u._id,u.role)}
                        >
                          {u.role==='admin'?'Make User':'Make Admin'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pages>1 && (
            <div className="flex justify-center space-x-2">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))}
                disabled={page===1}
                className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
              <span>{page}/{pages}</span>
              <button onClick={()=>setPage(p=>Math.min(p+1,pages))}
                disabled={page===pages}
                className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      </PageLoader>
    </AdminLayout>
  );
};

export default AdminUsers;
