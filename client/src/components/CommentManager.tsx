'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { RootState, AppDispatch } from '../store';
import { 
  fetchComments, 
  createComment, 
  updateComment, 
  deleteComment 
} from '../store/slices/commentSlice';
import { Plus, Edit, Trash2, X } from 'lucide-react';

interface CommentForm {
  content: string;
}

export default function CommentManager() {
  const dispatch = useDispatch<AppDispatch>();
  const { comments, isLoading } = useSelector((state: RootState) => state.comments);
  const { user } = useSelector((state: RootState) => state.auth);
  const [showModal, setShowModal] = useState(false);
  const [editingComment, setEditingComment] = useState<any>(null);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CommentForm>();

  useEffect(() => {
    dispatch(fetchComments());
  }, [dispatch]);

  const onSubmit = async (data: CommentForm) => {
    try {
      if (editingComment) {
        await dispatch(updateComment({ id: editingComment.id, content: data.content })).unwrap();
        toast.success('Comment updated successfully!');
      } else {
        await dispatch(createComment(data)).unwrap();
        toast.success('Comment created successfully!');
      }
      setShowModal(false);
      setEditingComment(null);
      reset();
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleEdit = (comment: any) => {
    // Check if user can edit this comment
    if (comment.userId !== user?.id && user?.role?.name !== 'admin') {
      toast.error('You can only edit your own comments');
      return;
    }
    
    setEditingComment(comment);
    setValue('content', comment.content);
    setShowModal(true);
  };

  const handleDelete = async (comment: any) => {
    // Check if user can delete this comment
    if (comment.userId !== user?.id && user?.role?.name !== 'admin') {
      toast.error('You can only delete your own comments');
      return;
    }

    if (confirm('Are you sure you want to delete this comment?')) {
      try {
        await dispatch(deleteComment(comment.id)).unwrap();
        toast.success('Comment deleted successfully!');
      } catch (error: any) {
        toast.error(error.message || 'Delete failed');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingComment(null);
    reset();
  };

  const canEditComment = (comment: any) => {
    return comment.userId === user?.id || user?.role?.name === 'admin';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Comments</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Comment
        </button>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-900">{comment.user.name}</h3>
                  <span className="ml-2 text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
              {canEditComment(comment) && (
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(comment)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(comment)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No comments yet. Be the first to add one!</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingComment ? 'Edit Comment' : 'Add Comment'}
              </h2>
              <button onClick={closeModal}>
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <textarea
                  {...register('content', { required: 'Content is required' })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Write your comment here..."
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingComment ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}