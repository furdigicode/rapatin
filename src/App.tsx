
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import FAQ from "./pages/FAQ";
import TentangKami from "./pages/TentangKami";
import Kontak from "./pages/Kontak";

// Feature Pages
import BayarSesuaiPakai from "./pages/fitur/BayarSesuaiPakai";
import Dashboard from "./pages/fitur/Dashboard";
import RekamanCloud from "./pages/fitur/RekamanCloud";
import LaporanPeserta from "./pages/fitur/LaporanPeserta";

// Company Pages
import SyaratKetentuan from "./pages/SyaratKetentuan";
import KebijakanPrivasi from "./pages/KebijakanPrivasi";
import MenjadiReseller from "./pages/MenjadiReseller";

// Blog Pages
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";

// Admin Pages
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import BlogManagement from "./pages/admin/BlogManagement";
import URLManagement from "./pages/admin/URLManagement";
import BrandLogoManagement from "./pages/admin/BrandLogoManagement";
import FAQManagement from "./pages/admin/FAQManagement";
import TestimonialManagement from "./pages/admin/TestimonialManagement";
import AboutManagement from "./pages/admin/AboutManagement";
import ContactManagement from "./pages/admin/ContactManagement";
import TermsManagement from "./pages/admin/TermsManagement";
import PrivacyManagement from "./pages/admin/PrivacyManagement";

const queryClient = new QueryClient();

// Create a separate component for the routes that can use hooks
const AppRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    // Handle CRISP chat
    // Initialize CRISP chat
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = "c876efde-7b19-4dc0-affd-2efcdc34ba2c";

    const d = document;
    const s = d.createElement("script");
    s.src = "https://client.crisp.chat/l.js";
    s.async = true;
    d.getElementsByTagName("head")[0].appendChild(s);
    
    // Track page view with Meta Pixel for non-admin pages
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }
  }, [location.pathname]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/faq" element={<FAQ />} />
      
      {/* Feature Pages */}
      <Route path="/fitur/bayar-sesuai-pakai" element={<BayarSesuaiPakai />} />
      <Route path="/fitur/dashboard" element={<Dashboard />} />
      <Route path="/fitur/rekaman-cloud" element={<RekamanCloud />} />
      <Route path="/fitur/laporan-peserta" element={<LaporanPeserta />} />
      
      {/* Company Pages */}
      <Route path="/syarat-ketentuan" element={<SyaratKetentuan />} />
      <Route path="/kebijakan-privasi" element={<KebijakanPrivasi />} />
      <Route path="/menjadi-reseller" element={<MenjadiReseller />} />
      <Route path="/tentang-kami" element={<TentangKami />} />
      <Route path="/kontak" element={<Kontak />} />
      
      {/* Blog Pages */}
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/blog" element={<BlogManagement />} />
      <Route path="/admin/urls" element={<URLManagement />} />
      <Route path="/admin/brand-logos" element={<BrandLogoManagement />} />
      <Route path="/admin/faq" element={<FAQManagement />} />
      <Route path="/admin/testimonials" element={<TestimonialManagement />} />
      <Route path="/admin/about" element={<AboutManagement />} />
      <Route path="/admin/contact" element={<ContactManagement />} />
      <Route path="/admin/terms" element={<TermsManagement />} />
      <Route path="/admin/privacy" element={<PrivacyManagement />} />
      
      {/* 404 Catch-all Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Main App component
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
