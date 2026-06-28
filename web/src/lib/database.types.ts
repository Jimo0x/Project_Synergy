export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'admin' | 'client' | 'freelancer'
export type PaymentMethod = 'mtn_momo' | 'orange_money' | 'stripe' | 'paypal'
export type OfferCategory = 'web' | 'design' | 'marketing' | 'branding' | 'seo' | 'maintenance' | 'writing' | 'other'
export type OfferStatus = 'open' | 'in_progress' | 'closed'
export type PortfolioCategory = 'design' | 'web' | 'marketing' | 'branding'
export type RequestStatus = 'open' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
export type OrderStatus = 'pending' | 'accepted' | 'in_progress' | 'delivered' | 'completed' | 'cancelled'
export type PaymentProvider = 'stripe' | 'paypal' | 'momo' | 'manual'
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded'

export interface Database {
  public: {
    Tables: {
      accounts_user: { Row: AccountsUserRow; Insert: AccountsUserInsert; Update: AccountsUserUpdate }
      accounts_clientprofile: { Row: AccountsClientProfileRow; Insert: AccountsClientProfileInsert; Update: AccountsClientProfileUpdate }
      accounts_message: { Row: AccountsMessageRow; Insert: AccountsMessageInsert; Update: AccountsMessageUpdate }
      accounts_clientoffer: { Row: AccountsClientOfferRow; Insert: AccountsClientOfferInsert; Update: AccountsClientOfferUpdate }
      core_portfolio: { Row: CorePortfolioRow; Insert: CorePortfolioInsert; Update: CorePortfolioUpdate }
      core_testimonial: { Row: CoreTestimonialRow; Insert: CoreTestimonialInsert; Update: CoreTestimonialUpdate }
      core_contactmessage: { Row: CoreContactMessageRow; Insert: CoreContactMessageInsert; Update: CoreContactMessageUpdate }
      core_servicecategory: { Row: CoreServiceCategoryRow; Insert: CoreServiceCategoryInsert; Update: CoreServiceCategoryUpdate }
      services_service: { Row: ServicesServiceRow; Insert: ServicesServiceInsert; Update: ServicesServiceUpdate }
      services_clientrequest: { Row: ServicesClientRequestRow; Insert: ServicesClientRequestInsert; Update: ServicesClientRequestUpdate }
      freelancers_skill: { Row: FreelancersSkillRow; Insert: FreelancersSkillInsert; Update: FreelancersSkillUpdate }
      freelancers_freelancerprofile: { Row: FreelancersFreelancerProfileRow; Insert: FreelancersFreelancerProfileInsert; Update: FreelancersFreelancerProfileUpdate }
      freelancers_freelancerprofile_skills: { Row: FreelancersFreelancerProfileSkillsRow; Insert: FreelancersFreelancerProfileSkillsInsert; Update: FreelancersFreelancerProfileSkillsUpdate }
      orders_order: { Row: OrdersOrderRow; Insert: OrdersOrderInsert; Update: OrdersOrderUpdate }
      payments_payment: { Row: PaymentsPaymentRow; Insert: PaymentsPaymentInsert; Update: PaymentsPaymentUpdate }
    }
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean }
    }
    Enums: {
      user_role: UserRole; payment_method: PaymentMethod; offer_category: OfferCategory
      offer_status: OfferStatus; portfolio_category: PortfolioCategory; request_status: RequestStatus
      order_status: OrderStatus; payment_provider: PaymentProvider; payment_status: PaymentStatus
    }
  }
}

export interface AccountsUserRow { id: string; email: string; first_name: string; last_name: string; role: UserRole; is_active: boolean; date_joined: string; notif_email: boolean; notif_push: boolean; notif_newsletter: boolean }
export interface AccountsUserInsert { id: string; email: string; first_name?: string; last_name?: string; role?: UserRole; is_active?: boolean; date_joined?: string; notif_email?: boolean; notif_push?: boolean; notif_newsletter?: boolean }
export interface AccountsUserUpdate { email?: string; first_name?: string; last_name?: string; role?: UserRole; is_active?: boolean; notif_email?: boolean; notif_push?: boolean; notif_newsletter?: boolean }
export interface AccountsClientProfileRow { id: number; user_id: string; avatar: string | null; phone: string; country: string; city: string; preferred_payment: PaymentMethod; total_orders: number; is_verified: boolean; created_at: string }
export interface AccountsClientProfileInsert { user_id: string; avatar?: string | null; phone?: string; country?: string; city?: string; preferred_payment?: PaymentMethod; total_orders?: number; is_verified?: boolean }
export interface AccountsClientProfileUpdate { avatar?: string | null; phone?: string; country?: string; city?: string; preferred_payment?: PaymentMethod; total_orders?: number; is_verified?: boolean }
export interface AccountsMessageRow { id: number; sender_id: string; receiver_id: string; body: string; is_read: boolean; created_at: string }
export interface AccountsMessageInsert { sender_id: string; receiver_id: string; body: string; is_read?: boolean }
export interface AccountsMessageUpdate { is_read?: boolean }
export interface AccountsClientOfferRow { id: number; client_id: string; title: string; description: string; category: OfferCategory; budget_min: number | null; budget_max: number | null; deadline_days: number; status: OfferStatus; created_at: string; updated_at: string }
export interface AccountsClientOfferInsert { client_id: string; title: string; description: string; category?: OfferCategory; budget_min?: number | null; budget_max?: number | null; deadline_days?: number; status?: OfferStatus }
export interface AccountsClientOfferUpdate { title?: string; description?: string; category?: OfferCategory; budget_min?: number | null; budget_max?: number | null; deadline_days?: number; status?: OfferStatus }
export interface CorePortfolioRow { id: number; title: string; slug: string; description: string; category: PortfolioCategory; image: string; client_name: string; technologies: string; project_url: string; featured: boolean; created_at: string }
export interface CorePortfolioInsert { title: string; slug: string; description: string; category: PortfolioCategory; image: string; client_name: string; technologies: string; project_url?: string; featured?: boolean }
export interface CorePortfolioUpdate { title?: string; slug?: string; description?: string; category?: PortfolioCategory; image?: string; client_name?: string; technologies?: string; project_url?: string; featured?: boolean }
export interface CoreTestimonialRow { id: number; client_name: string; client_company: string; client_avatar: string; content: string; rating: number; verified: boolean; created_at: string }
export interface CoreTestimonialInsert { client_name: string; client_company?: string; client_avatar?: string; content: string; rating?: number; verified?: boolean }
export interface CoreTestimonialUpdate { client_name?: string; client_company?: string; client_avatar?: string; content?: string; rating?: number; verified?: boolean }
export interface CoreContactMessageRow { id: number; name: string; email: string; phone: string; subject: string; message: string; is_read: boolean; created_at: string }
export interface CoreContactMessageInsert { name: string; email: string; phone?: string; subject: string; message: string }
export interface CoreContactMessageUpdate { is_read?: boolean }
export interface CoreServiceCategoryRow { id: number; title: string; slug: string; description: string; short_description: string; icon: string; price: number | null; duration: string; features: string; order: number }
export interface CoreServiceCategoryInsert { title: string; slug: string; description: string; short_description: string; icon: string; price?: number | null; duration?: string; features: string; order?: number }
export interface CoreServiceCategoryUpdate { title?: string; slug?: string; description?: string; short_description?: string; icon?: string; price?: number | null; duration?: string; features?: string; order?: number }
export interface ServicesServiceRow { id: number; title: string; slug: string; description: string; category: OfferCategory; price: number; delivery_time_days: number; created_by_id: string | null; image: string | null; thumbnail_image: string | null; is_active: boolean; created_at: string; updated_at: string }
export interface ServicesServiceInsert { title: string; slug?: string; description: string; category?: OfferCategory; price: number; delivery_time_days?: number; created_by_id?: string | null; image?: string | null; thumbnail_image?: string | null; is_active?: boolean }
export interface ServicesServiceUpdate { title?: string; description?: string; category?: OfferCategory; price?: number; delivery_time_days?: number; image?: string | null; thumbnail_image?: string | null; is_active?: boolean }
export interface ServicesClientRequestRow { id: number; client_id: string; title: string; description: string; category: OfferCategory; budget: number; deadline: string; status: RequestStatus; created_at: string }
export interface ServicesClientRequestInsert { client_id: string; title: string; description: string; category?: OfferCategory; budget: number; deadline: string; status?: RequestStatus }
export interface ServicesClientRequestUpdate { title?: string; description?: string; category?: OfferCategory; budget?: number; deadline?: string; status?: RequestStatus }
export interface FreelancersSkillRow { id: number; name: string; slug: string }
export interface FreelancersSkillInsert { name: string; slug?: string }
export interface FreelancersSkillUpdate { name?: string }
export interface FreelancersFreelancerProfileRow { id: number; user_id: string; bio: string; hourly_rate: number | null; portfolio_url: string | null; avatar: string | null; linkedin_url: string | null; github_url: string | null; rating: number; available: boolean; created_at: string }
export interface FreelancersFreelancerProfileInsert { user_id: string; bio?: string; hourly_rate?: number | null; portfolio_url?: string | null; avatar?: string | null; linkedin_url?: string | null; github_url?: string | null; rating?: number; available?: boolean }
export interface FreelancersFreelancerProfileUpdate { bio?: string; hourly_rate?: number | null; portfolio_url?: string | null; avatar?: string | null; linkedin_url?: string | null; github_url?: string | null; rating?: number; available?: boolean }
export interface FreelancersFreelancerProfileSkillsRow { id: number; freelancerprofile_id: number; skill_id: number }
export interface FreelancersFreelancerProfileSkillsInsert { freelancerprofile_id: number; skill_id: number }
export interface FreelancersFreelancerProfileSkillsUpdate { freelancerprofile_id?: number; skill_id?: number }
export interface OrdersOrderRow { id: number; service_id: number; client_id: string; freelancer_id: string | null; status: OrderStatus; price: number; instructions: string; attachment: string | null; due_date: string | null; created_at: string; updated_at: string }
export interface OrdersOrderInsert { service_id: number; client_id: string; freelancer_id?: string | null; status?: OrderStatus; price: number; instructions?: string; attachment?: string | null; due_date?: string | null }
export interface OrdersOrderUpdate { freelancer_id?: string | null; status?: OrderStatus; instructions?: string; due_date?: string | null }
export interface PaymentsPaymentRow { id: number; order_id: number; amount: number; currency: string; provider: PaymentProvider; provider_transaction_id: string | null; provider_data: Json | null; status: PaymentStatus; released: boolean; created_at: string; updated_at: string }
export interface PaymentsPaymentInsert { order_id: number; amount: number; currency?: string; provider?: PaymentProvider; provider_transaction_id?: string | null; provider_data?: Json | null; status?: PaymentStatus; released?: boolean }
export interface PaymentsPaymentUpdate { provider_transaction_id?: string | null; provider_data?: Json | null; status?: PaymentStatus; released?: boolean }
