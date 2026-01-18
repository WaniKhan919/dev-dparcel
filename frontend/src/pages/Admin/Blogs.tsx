import { useDispatch, useSelector } from "react-redux";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { fetchBlogs } from "../../slices/admin/getBlogsSlice";
import ComponentCard from "../../components/common/ComponentCard";
import DParcelTable from "../../components/tables/DParcelTable";
import { useEffect, useState } from "react";
import { AppDispatch } from "../../store";
import { useNavigate } from "react-router";
import { PencilIcon, TrashBinIcon } from "../../icons";
import { EyeIcon } from "@heroicons/react/24/outline";
import { Modal } from "../../components/ui/modal";
import { DeleteConfirmModal } from "../../components/delete/ConfirmDeleteModal";
import { ApiHelper } from "../../utils/ApiHelper";
import { toast } from "react-hot-toast";

export default function Blogs() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading } = useSelector((state: any) => state.blogs);

  const [viewBlog, setViewBlog] = useState<any>(null); // For viewing modal
  const [deleteBlog, setDeleteBlog] = useState<any>(null); // For delete modal

  // Fetch blogs
  useEffect(() => {
    dispatch(fetchBlogs({ page: 1, per_page: 10 }));
  }, [dispatch]);

  // Delete function
  const handleDelete = async (id: string) => {
    try {
      const res = await ApiHelper("DELETE", `/admin/blogs/${id}`);
      if (res.status === 200) {
        toast.success("Blog deleted successfully!");
        dispatch(fetchBlogs({ page: 1, per_page: 10 }));
      } else {
        toast.error("Failed to delete blog ❌");
      }
    } catch (err) {
      toast.error("Something went wrong ❌");
      console.error(err);
    }
  };

  const columns = [
    { key: "title", header: "Title" },
    { key: "slug", header: "Slug" },
    { key: "author_name", header: "Author" },
    {
      key: "published_at",
      header: "Published At",
      render: (record: any) => (
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">
            {record.published_at ? new Date(record.published_at).toLocaleDateString() : "-"}
          </span>
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Created At",
      render: (record: any) => (
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">
            {record.created_at ? new Date(record.created_at).toLocaleDateString() : "-"}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (record: any) => (
        <div className="flex gap-2">
          {/* View */}
          <button
            onClick={() => setViewBlog(record)}
            className="p-2 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
            title="View"
          >
            <EyeIcon className="h-5 w-5 text-gray-800 stroke-2" />
          </button>

          {/* Edit */}
          <button
            onClick={() =>
              navigate("/blogs/edit", { state: { blog: record } })
            }
            className="p-2 rounded bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
            title="Edit"
          >
            <PencilIcon />
          </button>

          {/* Delete */}
          <button
            onClick={() => setDeleteBlog(record)}
            className="p-2 rounded bg-red-100 text-red-600 hover:bg-red-200"
            title="Delete"
          >
            <TrashBinIcon />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageMeta title="Admin | Blogs" description="Manage Blogs" />
      <PageBreadcrumb pageTitle="Blogs" />

      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate("/blogs/create")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          + Add Blog
        </button>
      </div>

      <ComponentCard title="Blogs">
        <DParcelTable columns={columns} data={data} />
      </ComponentCard>

      {/* View Modal */}
      <Modal
        isOpen={!!viewBlog}
        onClose={() => setViewBlog(null)}
        className="max-w-4xl p-8"
      >
        {viewBlog && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">{viewBlog.title}</h2>
            <p className="text-sm text-gray-500 italic">Slug: {viewBlog.slug}</p>
            <div dangerouslySetInnerHTML={{ __html: viewBlog.content }} />
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteBlog}
        onClose={() => setDeleteBlog(null)}
        onConfirm={async () => {
          if (deleteBlog) {
            await handleDelete(deleteBlog.id);
            setDeleteBlog(null);
          }
        }}
        itemName={deleteBlog?.title}
      />
    </>
  );
}
