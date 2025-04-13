
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash, Eye, ArrowRight, Calendar, Tag, User, Link as LinkIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from '@/components/admin/RichTextEditor';
import SEOPanel from '@/components/admin/SEOPanel';
import { BlogPost, BlogPostFormData, defaultBlogPostFormData } from '@/types/BlogTypes';
import { supabase } from '@/integrations/supabase/client';

const BlogManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<BlogPostFormData>({
    ...defaultBlogPostFormData
  });

  // Fetch categories from Supabase
  const { data: categoriesData } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('name')
        .order('name');
      
      if (error) {
        console.error('Error fetching categories:', error);
        toast({
          variant: "destructive",
          title: "Error fetching categories",
          description: error.message,
        });
        return [];
      }
      
      return data.map(category => category.name);
    },
  });

  const categories = categoriesData || [];

  // Fetch blog posts from Supabase
  const { data: blogPosts = [], isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching blog posts:', error);
        toast({
          variant: "destructive",
          title: "Error fetching blog posts",
          description: error.message,
        });
        return [];
      }
      
      return data.map(post => ({
        id: post.id,
        title: post.title || '',
        slug: post.slug || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        coverImage: post.cover_image || '',
        category: post.category || '',
        author: post.author || 'Admin',
        date: new Date(post.created_at).toLocaleDateString('id-ID', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        status: post.status as 'draft' | 'published' | 'scheduled',
        publishedAt: post.published_at || '',
        seoTitle: post.seo_title || '',
        metaDescription: post.meta_description || '',
        focusKeyword: post.focus_keyword || ''
      }));
    },
  });

  // Auto-update SEO title when main title changes (if SEO title is empty)
  useEffect(() => {
    if (formData.title && !formData.seoTitle) {
      setFormData({...formData, seoTitle: formData.title});
    }
  }, [formData.title]);

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: BlogPostFormData) => {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert({
          title: postData.title,
          slug: postData.slug,
          excerpt: postData.excerpt,
          content: postData.content,
          cover_image: postData.coverImage,
          category: postData.category,
          author: postData.author,
          status: postData.status,
          published_at: postData.status === 'published' ? new Date().toISOString() : postData.publishedAt,
          seo_title: postData.seoTitle,
          meta_description: postData.metaDescription,
          focus_keyword: postData.focusKeyword
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast({
        title: "Artikel berhasil dibuat",
        description: `Artikel "${formData.title}" telah berhasil dibuat`,
      });
      setIsCreating(false);
      setFormData({
        ...defaultBlogPostFormData,
        category: categories.length > 0 ? categories[0] : ''
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Terjadi kesalahan",
        description: error.message,
      });
    }
  });

  // Update post mutation
  const updatePostMutation = useMutation({
    mutationFn: async (postData: BlogPostFormData & { id: string }) => {
      const { data, error } = await supabase
        .from('blog_posts')
        .update({
          title: postData.title,
          slug: postData.slug,
          excerpt: postData.excerpt,
          content: postData.content,
          cover_image: postData.coverImage,
          category: postData.category,
          author: postData.author,
          status: postData.status,
          published_at: postData.status === 'published' && !postData.publishedAt ? new Date().toISOString() : postData.publishedAt,
          seo_title: postData.seoTitle,
          meta_description: postData.metaDescription,
          focus_keyword: postData.focusKeyword
        })
        .eq('id', postData.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast({
        title: "Artikel berhasil diperbarui",
        description: `Artikel "${formData.title}" telah berhasil diperbarui`,
      });
      setIsEditing(null);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Terjadi kesalahan",
        description: error.message,
      });
    }
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast({
        title: "Artikel berhasil dihapus",
        description: "Artikel telah berhasil dihapus",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Terjadi kesalahan",
        description: error.message,
      });
    }
  });

  // Publish post mutation
  const publishPostMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('blog_posts')
        .update({
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast({
        title: "Artikel berhasil dipublikasikan",
        description: "Artikel telah berhasil dipublikasikan",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Terjadi kesalahan",
        description: error.message,
      });
    }
  });

  const handleInputChange = (field: keyof BlogPostFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCreatePost = () => {
    if (!formData.title || !formData.content) {
      toast({
        variant: "destructive",
        title: "Terjadi kesalahan",
        description: "Judul dan konten harus diisi",
      });
      return;
    }
    
    // Generate slug if empty
    let finalSlug = formData.slug;
    if (!finalSlug) {
      finalSlug = formData.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
    }
    
    createPostMutation.mutate({
      ...formData,
      slug: finalSlug
    });
  };

  const handleStartEdit = (post: BlogPost) => {
    setIsEditing(post.id as string);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage,
      category: post.category,
      author: post.author,
      date: post.date,
      status: post.status,
      publishedAt: post.publishedAt ? post.publishedAt : '',
      seoTitle: post.seoTitle,
      metaDescription: post.metaDescription,
      focusKeyword: post.focusKeyword
    });
  };

  const handleUpdatePost = () => {
    if (!isEditing) return;
    
    if (!formData.title || !formData.content) {
      toast({
        variant: "destructive",
        title: "Terjadi kesalahan",
        description: "Judul dan konten harus diisi",
      });
      return;
    }
    
    // Generate slug if empty
    let finalSlug = formData.slug;
    if (!finalSlug) {
      finalSlug = formData.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
    }
    
    updatePostMutation.mutate({
      id: isEditing,
      ...formData,
      slug: finalSlug
    });
  };

  const handleDeletePost = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus artikel ini?")) {
      deletePostMutation.mutate(id);
    }
  };

  const handlePublishPost = (id: string) => {
    publishPostMutation.mutate(id);
  };

  const handleImageUpload = () => {
    // In a real implementation, this would open a file picker and upload the image
    const imageUrl = prompt("Enter image URL (in production, this would be a file upload):");
    if (imageUrl) {
      setFormData({...formData, coverImage: imageUrl});
    }
  };

  const renderBlogForm = (action: 'create' | 'edit') => {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {action === 'create' ? 'Buat Artikel Baru' : 'Edit Artikel'}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => action === 'create' ? setIsCreating(false) : setIsEditing(null)}>
              Batal
            </Button>
            <Button onClick={action === 'create' ? handleCreatePost : handleUpdatePost}>
              {action === 'create' ? 'Simpan Artikel' : 'Perbarui Artikel'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="content">
          <TabsList>
            <TabsTrigger value="content">Konten</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="settings">Pengaturan</TabsTrigger>
          </TabsList>
          
          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Judul Artikel</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Masukkan judul artikel"
                className="text-lg"
              />
            </div>
            
            {/* Cover Image */}
            <div className="space-y-2">
              <Label>Cover Image</Label>
              <div className="flex items-start gap-4">
                {formData.coverImage && (
                  <div className="w-1/3">
                    <img 
                      src={formData.coverImage} 
                      alt="Cover preview" 
                      className="w-full h-auto rounded-md border object-cover aspect-[16/9]" 
                    />
                  </div>
                )}
                <div className={formData.coverImage ? "w-2/3" : "w-full"}>
                  <div className="flex gap-2">
                    <Input
                      value={formData.coverImage}
                      onChange={(e) => handleInputChange('coverImage', e.target.value)}
                      placeholder="URL gambar cover"
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={handleImageUpload}>
                      Upload
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ukuran ideal: 1200x627 piksel (rasio 1.91:1)
                  </p>
                </div>
              </div>
            </div>
            
            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">Ringkasan</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                placeholder="Masukkan ringkasan artikel (akan ditampilkan di halaman blog)"
                rows={2}
              />
            </div>
            
            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Konten</Label>
              <RichTextEditor 
                value={formData.content}
                onChange={(value) => handleInputChange('content', value)}
              />
            </div>
          </TabsContent>
          
          {/* SEO Tab */}
          <TabsContent value="seo">
            <SEOPanel
              title={formData.seoTitle}
              setTitle={(value) => handleInputChange('seoTitle', value)}
              slug={formData.slug}
              setSlug={(value) => handleInputChange('slug', value)}
              metaDescription={formData.metaDescription}
              setMetaDescription={(value) => handleInputChange('metaDescription', value)}
              focusKeyword={formData.focusKeyword}
              setFocusKeyword={(value) => handleInputChange('focusKeyword', value)}
              content={formData.content}
            />
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-6">
                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category" className="flex items-center gap-2">
                    <Tag size={14} />
                    Kategori
                  </Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                {/* Author */}
                <div className="space-y-2">
                  <Label htmlFor="author" className="flex items-center gap-2">
                    <User size={14} />
                    Penulis
                  </Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => handleInputChange('author', e.target.value)}
                  />
                </div>
                
                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status Publikasi</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as 'draft' | 'published' | 'scheduled')}
                    className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
                
                {/* Published Date/Time */}
                {formData.status === 'scheduled' && (
                  <div className="space-y-2">
                    <Label htmlFor="publishedAt" className="flex items-center gap-2">
                      <Calendar size={14} />
                      Jadwal Publikasi
                    </Label>
                    <Input
                      id="publishedAt"
                      type="datetime-local"
                      value={formData.publishedAt}
                      onChange={(e) => handleInputChange('publishedAt', e.target.value)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <AdminLayout title="Manajemen Blog">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : isCreating ? (
        renderBlogForm('create')
      ) : isEditing !== null ? (
        renderBlogForm('edit')
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Manajemen Artikel</h2>
              <p className="text-muted-foreground">Kelola semua artikel blog Anda</p>
            </div>
            <Button onClick={() => setIsCreating(true)} className="gap-2">
              <Plus size={16} />
              Tambah Artikel
            </Button>
          </div>
          
          <div className="space-y-4">
            {blogPosts.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground mb-4">Belum ada artikel. Klik tombol di atas untuk membuat artikel pertama Anda.</p>
                  <Button onClick={() => setIsCreating(true)} className="gap-2">
                    <Plus size={16} />
                    Tambah Artikel
                  </Button>
                </CardContent>
              </Card>
            ) : (
              blogPosts.map((post) => (
                <Card key={post.id} className={post.status === 'draft' ? 'border-dashed' : ''}>
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {/* Cover image */}
                      {post.coverImage && (
                        <div className="hidden sm:block w-32 h-32 rounded-md overflow-hidden flex-shrink-0">
                          <img 
                            src={post.coverImage} 
                            alt={post.title} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                post.status === 'published' 
                                  ? 'bg-green-100 text-green-800' 
                                  : post.status === 'scheduled'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {post.status === 'published' 
                                  ? 'Published' 
                                  : post.status === 'scheduled'
                                  ? 'Scheduled'
                                  : 'Draft'
                                }
                              </span>
                              <span className="text-xs text-muted-foreground">{post.date}</span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">{post.category}</span>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User size={12} />
                                <span>{post.author}</span>
                              </div>
                              {post.slug && (
                                <div className="flex items-center gap-1">
                                  <LinkIcon size={12} />
                                  <span className="truncate max-w-[200px]">/blog/{post.slug}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" className="h-8 gap-1 min-w-20" title="Lihat">
                          <Eye size={14} />
                          <span>Lihat</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 gap-1 min-w-20" 
                          onClick={() => handleStartEdit(post)}
                          title="Edit"
                        >
                          <Edit size={14} />
                          <span>Edit</span>
                        </Button>
                        {post.status === 'draft' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 gap-1 text-green-600 hover:text-green-700 min-w-20" 
                            onClick={() => handlePublishPost(post.id as string)}
                            title="Publikasikan"
                          >
                            <ArrowRight size={14} />
                            <span>Publish</span>
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 gap-1 text-destructive hover:text-destructive min-w-20" 
                          onClick={() => handleDeletePost(post.id as string)}
                          title="Hapus"
                        >
                          <Trash size={14} />
                          <span>Hapus</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default BlogManagement;
