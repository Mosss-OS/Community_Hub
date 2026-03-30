import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, MessageCircle, Share2, MoreHorizontal, Pin, Trash2, Edit, Send, TrendingUp, UserPlus, UserMinus, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

interface Post {
  id: number;
  userId: string;
  content: string;
  type: string;
  visibility: string;
  imageUrl: string | null;
  videoUrl: string | null;
  verseReference: string | null;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isPinned: boolean;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage: string | null;
  } | null;
  hasLiked: boolean;
}

interface Comment {
  id: number;
  userId: string;
  content: string;
  parentId: number | null;
  likesCount: number;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage: string | null;
  } | null;
}

export default function SocialFeedPage() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState("");
  const [postType, setPostType] = useState<"TEXT" | "TESTIMONY" | "PRAYER_REQUEST" | "ANNOUNCEMENT">("TEXT");
  const [sharePost, setSharePost] = useState<{id: number; content: string} | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: posts, isLoading: loadingPosts, refetch: refetchPosts } = useQuery<Post[]>({
    queryKey: ["/api/feed"],
    queryFn: async () => {
      const res = await fetch("/api/feed");
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
  });

  const { data: trendingHashtags } = useQuery({
    queryKey: ["/api/hashtags/trending"],
    queryFn: async () => {
      const res = await fetch("/api/hashtags/trending");
      if (!res.ok) throw new Error("Failed to fetch hashtags");
      return res.json();
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newPostContent,
          type: postType,
          visibility: "MEMBERS_ONLY",
        }),
      });
      if (!res.ok) throw new Error("Failed to create post");
      return res.json();
    },
    onSuccess: () => {
      setNewPostContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (postId: number) => {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to like post");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
      if (selectedPost) {
        queryClient.invalidateQueries({ queryKey: ["/api/posts", selectedPost.id] });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (postId: number) => {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete post");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
    },
  });

  const pinMutation = useMutation({
    mutationFn: async (postId: number) => {
      const res = await fetch(`/api/posts/${postId}/pin`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to pin post");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
    },
  });

  const followMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to follow user");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
    },
  });

  const { data: postDetails } = useQuery({
    queryKey: ["/api/posts", selectedPost?.id],
    queryFn: async () => {
      if (!selectedPost) return null;
      const res = await fetch(`/api/posts/${selectedPost.id}`);
      if (!res.ok) throw new Error("Failed to fetch post");
      return res.json();
    },
    enabled: !!selectedPost,
  });

  const addCommentMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPost) return;
      const res = await fetch(`/api/posts/${selectedPost.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });
      if (!res.ok) throw new Error("Failed to add comment");
      return res.json();
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/posts", selectedPost?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
    },
  });

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName) return "?";
    return `${firstName.charAt(0)}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "TESTIMONY": return "Testimony";
      case "PRAYER_REQUEST": return "Prayer Request";
      case "ANNOUNCEMENT": return "Announcement";
      default: return "Post";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "TESTIMONY": return "bg-green-100 text-green-700";
      case "PRAYER_REQUEST": return "bg-blue-100 text-blue-700";
      case "ANNOUNCEMENT": return "bg-purple-100 text-purple-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Community Feed</h1>
        <p className="text-slate-600 mt-2">Share, pray, and grow together as a community</p>
      </div>

      {/* Create Post Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.profileImage || ""} />
              <AvatarFallback>{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="What's on your heart? Share with the community..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="min-h-[100px] resize-none"
              />
              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-2">
                  {(["TEXT", "TESTIMONY", "PRAYER_REQUEST", "ANNOUNCEMENT"] as const).map((type) => (
                    <Button
                      key={type}
                      variant={postType === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPostType(type)}
                      className={`text-xs ${postType === type ? "" : "bg-transparent"}`}
                    >
                      {getTypeLabel(type)}
                    </Button>
                  ))}
                </div>
                <Button
                  onClick={() => createPostMutation.mutate()}
                  disabled={!newPostContent.trim() || createPostMutation.isPending}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {createPostMutation.isPending ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-4">
          {loadingPosts ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-card">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            posts.map((post) => (
              <Card key={post.id} className={post.isPinned ? "border-amber-400 bg-amber-50" : ""}>
                {post.isPinned && (
                  <div className="bg-amber-100 px-4 py-1 text-xs font-medium text-amber-700 flex items-center gap-1">
                    <Pin className="w-3 h-3" /> Pinned Post
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 cursor-pointer" onClick={() => post.user && setLocation(`/members/${post.user.id}`)}>
                        <AvatarImage src={post.user?.profileImage || ""} />
                        <AvatarFallback>{getInitials(post.user?.firstName, post.user?.lastName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {post.user?.firstName} {post.user?.lastName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {format(new Date(post.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(post.type)}`}>
                        {getTypeLabel(post.type)}
                      </span>
                      {user?.isAdmin && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => pinMutation.mutate(post.id)}>
                          <Pin className="w-4 h-4" />
                        </Button>
                      )}
                      {(user?.id === post.userId || user?.isAdmin) && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                          if (confirm("Delete this post?")) {
                            deleteMutation.mutate(post.id);
                          }
                        }}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap">{post.content}</p>
                  
                  {post.verseReference && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm font-medium text-amber-800">{post.verseReference}</p>
                    </div>
                  )}
                  
                  {post.imageUrl && (
                    <img src={post.imageUrl} alt="Post" className="mt-3 rounded-lg max-h-96 object-cover w-full" />
                  )}

                  {post.videoUrl && (
                    <video src={post.videoUrl} controls className="mt-3 rounded-lg w-full max-h-96" />
                  )}

                  <div className="flex items-center gap-6 mt-4 pt-4 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={post.hasLiked ? "text-red-500" : "text-slate-500"}
                      onClick={() => likeMutation.mutate(post.id)}
                    >
                      <Heart className={`w-4 h-4 mr-1 ${post.hasLiked ? "fill-current" : ""}`} />
                      {post.likesCount}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-500"
                      onClick={() => setSelectedPost(post)}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {post.commentsCount}
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-slate-500" onClick={() => setSharePost({id: post.id, content: post.content})}>
                          <Share2 className="w-4 h-4 mr-1" />
                          {post.sharesCount}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Share Post</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 line-clamp-3">{post.content}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input 
                              readOnly 
                              value={`${typeof window !== "undefined" ? window.location.origin : ""}/feed?post=${post.id}`}
                              className="flex-1"
                            />
                            <Button size="sm" variant="outline" onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/feed?post=${post.id}`);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}>
                              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    {user?.id !== post.userId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto text-slate-500"
                        onClick={() => post.user && followMutation.mutate(post.user.id)}
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        Follow
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-slate-500">No posts yet. Be the first to share!</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Trending Hashtags */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Trending Topics
              </h3>
            </CardHeader>
            <CardContent>
              {trendingHashtags && trendingHashtags.length > 0 ? (
                <div className="space-y-2">
                  {trendingHashtags.map((tag: any) => (
                    <div
                      key={tag.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                      onClick={() => setLocation(`/hashtags/${tag.name}`)}
                    >
                      <span className="text-indigo-600 font-medium">#{tag.name}</span>
                      <span className="text-xs text-slate-500">{tag.postsCount} posts</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No trending topics yet</p>
              )}
            </CardContent>
          </Card>

          {/* Community Guidelines */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Community Guidelines</h3>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 space-y-2">
              <p>• Share testimonies and prayer requests</p>
              <p>• Be supportive and encouraging</p>
              <p>• Keep content faith-based and positive</p>
              <p>• Respect privacy and confidentiality</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Comments Modal */}
      {selectedPost && postDetails && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPost(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={postDetails.user?.profileImage || ""} />
                  <AvatarFallback>{getInitials(postDetails.user?.firstName, postDetails.user?.lastName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{postDetails.user?.firstName} {postDetails.user?.lastName}</p>
                  <p className="text-xs text-slate-500">{format(new Date(postDetails.createdAt), "MMM d, yyyy 'at' h:mm a")}</p>
                </div>
              </div>
              <p className="mt-4 text-slate-700 whitespace-pre-wrap">{postDetails.content}</p>
            </div>
            
            <div className="p-4 border-b max-h-64 overflow-y-auto">
              <h4 className="font-medium text-sm text-slate-500 mb-3">Comments ({postDetails.comments?.length || 0})</h4>
              <div className="space-y-4">
                {postDetails.comments?.map((comment: Comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user?.profileImage || ""} />
                      <AvatarFallback className="text-xs">{getInitials(comment.user?.firstName, comment.user?.lastName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="font-medium text-sm">{comment.user?.firstName} {comment.user?.lastName}</p>
                        <p className="text-slate-700 text-sm">{comment.content}</p>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{format(new Date(comment.createdAt), "MMM d 'at' h:mm a")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex gap-3">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>
              <div className="flex justify-end mt-3">
                <Button
                  onClick={() => addCommentMutation.mutate()}
                  disabled={!newComment.trim() || addCommentMutation.isPending}
                >
                  {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
