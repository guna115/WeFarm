const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  return response.json();
}

// =====================
// Posts API
// =====================

export async function getNearbyPosts(
  lat: number,
  lng: number,
  radius?: number,
  category?: string
) {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
  });
  if (radius) params.set('radius', radius.toString());
  if (category && category !== 'all') params.set('category', category);

  return apiFetch(`/posts/nearby?${params}`);
}

export async function searchPosts(query: string, lat?: number, lng?: number) {
  const params = new URLSearchParams({ q: query });
  if (lat) params.set('lat', lat.toString());
  if (lng) params.set('lng', lng.toString());

  return apiFetch(`/posts/search?${params}`);
}

export async function createPost(data: any, token: string) {
  return apiFetch('/posts/create', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

export async function deletePost(postId: string, token: string) {
  return apiFetch(`/posts/${postId}`, {
    method: 'DELETE',
    token,
  });
}

export async function reportPost(postId: string, reason: string) {
  return apiFetch(`/posts/${postId}/report`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

// =====================
// Seller API
// =====================

export async function getSellerProfile(token: string) {
  return apiFetch('/seller/profile', { token });
}

export async function updateSellerProfile(data: any, token: string) {
  return apiFetch('/seller/profile', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

export async function getSellerPosts(token: string) {
  return apiFetch('/seller/posts', { token });
}

export async function getSellerId(token: string) {
  return apiFetch('/seller/id', { token });
}

// =====================
// Auth API
// =====================

export async function verifyToken(idToken: string) {
  return apiFetch('/auth/verify', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  });
}
