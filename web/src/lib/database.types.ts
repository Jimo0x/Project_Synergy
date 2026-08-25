export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'admin' | 'client' | 'freelancer'
export type PaymentMethod = 'mtn_momo' | 'orange_money' | 'stripe' | 'paypal'
export type OfferCategory = 'web' | 'design' | 'marketing' | 'branding' | 'seo' | 'maintenance' | 'writing' | 'other'
export type OfferStatus = 'open' | 'in_progress' | 'closed'
export type PortfolioCategory = 'design' | 'web' | 'marketing' | 'branding'
export type RequestStatus = 'open' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
export type OrderStatus = 'pending' | 'paid' |  'accepted' | 'in_progress' | 'delivered' | 'completed' | 'cancelled'
export type PaymentProvider = 'stripe' | 'paypal' | 'momo' | 'manual' | 'fedapay'
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded'

export type Database = {
  public: {
    Tables: {
      accounts_user: { Row: AccountsUserRow; Insert: AccountsUserInsert; Update: AccountsUserUpdate; Relationships: [] }
      accounts_clientprofile: { Row: AccountsClientProfileRow; Insert: AccountsClientProfileInsert; Update: AccountsClientProfileUpdate; Relationships: [
        { foreignKeyName: 'accounts_clientprofile_user_id_fkey'; columns: ['user_id']; referencedRelation: 'accounts_user'; referencedColumns: ['id']; isOneToOne: true }
      ] }
      accounts_message: { Row: AccountsMessageRow; Insert: AccountsMessageInsert; Update: AccountsMessageUpdate; Relationships: [
        { foreignKeyName: 'accounts_message_sender_id_fkey'; columns: ['sender_id']; referencedRelation: 'accounts_user'; referencedColumns: ['id'] },
        { foreignKeyName: 'accounts_message_receiver_id_fkey'; columns: ['receiver_id']; referencedRelation: 'accounts_user'; referencedColumns: ['id'] }
      ] }
      accounts_clientoffer: { Row: AccountsClientOfferRow; Insert: AccountsClientOfferInsert; Update: AccountsClientOfferUpdate; Relationships: [
        { foreignKeyName: 'accounts_clientoffer_client_id_fkey'; columns: ['client_id']; referencedRelation: 'accounts_user'; referencedColumns: ['id'] }
      ] }
      core_portfolio: { Row: CorePortfolioRow; Insert: CorePortfolioInsert; Update: CorePortfolioUpdate; Relationships: [] }
      core_testimonial: { Row: CoreTestimonialRow; Insert: CoreTestimonialInsert; Update: CoreTestimonialUpdate; Relationships: [] }
      core_contactmessage: { Row: CoreContactMessageRow; Insert: CoreContactMessageInsert; Update: CoreContactMessageUpdate; Relationships: [] }
      core_servicecategory: { Row: CoreServiceCategoryRow; Insert: CoreServiceCategoryInsert; Update: CoreServiceCategoryUpdate; Relationships: [] }
      services_service: { Row: ServicesServiceRow; Insert: ServicesServiceInsert; Update: ServicesServiceUpdate; Relationships: [
        { foreignKeyName: 'services_service_created_by_id_fkey'; columns: ['created_by_id']; referencedRelation: 'accounts_user'; referencedColumns: ['id'] }
      ] }
      services_clientrequest: { Row: ServicesClientRequestRow; Insert: ServicesClientRequestInsert; Update: ServicesClientRequestUpdate; Relationships: [
        { foreignKeyName: 'services_clientrequest_client_id_fkey'; columns: ['client_id']; referencedRelation: 'accounts_user'; referencedColumns: ['id'] }
      ] }
      freelancers_skill: { Row: FreelancersSkillRow; Insert: FreelancersSkillInsert; Update: FreelancersSkillUpdate; Relationships: [] }
      freelancers_freelancerprofile: { Row: FreelancersFreelancerProfileRow; Insert: FreelancersFreelancerProfileInsert; Update: FreelancersFreelancerProfileUpdate; Relationships: [
        { foreignKeyName: 'freelancers_freelancerprofile_user_id_fkey'; columns: ['user_id']; referencedRelation: 'accounts_user'; referencedColumns: ['id']; isOneToOne: true }
      ] }
      freelancers_freelancerprofile_skills: { Row: FreelancersFreelancerProfileSkillsRow; Insert: FreelancersFreelancerProfileSkillsInsert; Update: FreelancersFreelancerProfileSkillsUpdate; Relationships: [
        { foreignKeyName: 'freelancers_freelancerprofile_skills_freelancerprofile_id_fkey'; columns: ['freelancerprofile_id']; referencedRelation: 'freelancers_freelancerprofile'; referencedColumns: ['id'] },
        { foreignKeyName: 'freelancers_freelancerprofile_skills_skill_id_fkey'; columns: ['skill_id']; referencedRelation: 'freelancers_skill'; referencedColumns: ['id'] }
      ] }
      orders_order: { Row: OrdersOrderRow; Insert: OrdersOrderInsert; Update: OrdersOrderUpdate; Relationships: [
        { foreignKeyName: 'orders_order_service_id_fkey'; columns: ['service_id']; referencedRelation: 'services_service'; referencedColumns: ['id'] },
        { foreignKeyName: 'orders_order_client_id_fkey'; columns: ['client_id']; referencedRelation: 'accounts_user'; referencedColumns: ['id'] },
        { foreignKeyName: 'orders_order_freelancer_id_fkey'; columns: ['freelancer_id']; referencedRelation: 'accounts_user'; referencedColumns: ['id'] }
      ] }
      payments_payment: { Row: PaymentsPaymentRow; Insert: PaymentsPaymentInsert; Update: PaymentsPaymentUpdate; Relationships: [
        { foreignKeyName: 'payments_payment_order_id_fkey'; columns: ['order_id']; referencedRelation: 'orders_order'; referencedColumns: ['id'] }
      ] }
    }
    Views: {
      public_profiles: {
        Row: { id: string; first_name: string; last_name: string; role: UserRole }
        Relationships: []
      }
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
};

export type AccountsUserRow = { id: string; email: string; first_name: string; last_name: string; role: UserRole; is_active: boolean; date_joined: string; notif_email: boolean; notif_push: boolean; notif_newsletter: boolean }
export type AccountsUserInsert = { id: string; email: string; first_name?: string; last_name?: string; role?: UserRole; is_active?: boolean; date_joined?: string; notif_email?: boolean; notif_push?: boolean; notif_newsletter?: boolean }
export type AccountsUserUpdate = { email?: string; first_name?: string; last_name?: string; role?: UserRole; is_active?: boolean; notif_email?: boolean; notif_push?: boolean; notif_newsletter?: boolean }
export type AccountsClientProfileRow = { id: number; user_id: string; avatar: string | null; phone: string; country: string; city: string; preferred_payment: PaymentMethod; total_orders: number; is_verified: boolean; created_at: string }
export type AccountsClientProfileInsert = { user_id: string; avatar?: string | null; phone?: string; country?: string; city?: string; preferred_payment?: PaymentMethod; total_orders?: number; is_verified?: boolean }
export type AccountsClientProfileUpdate = { avatar?: string | null; phone?: string; country?: string; city?: string; preferred_payment?: PaymentMethod; total_orders?: number; is_verified?: boolean }
export type AccountsMessageRow = { id: number; sender_id: string; receiver_id: string; body: string; is_read: boolean; created_at: string }
export type AccountsMessageInsert = { sender_id: string; receiver_id: string; body: string; is_read?: boolean }
export type AccountsMessageUpdate = { is_read?: boolean }
export type AccountsClientOfferRow = { id: number; client_id: string; title: string; description: string; category: OfferCategory; budget_min: number | null; budget_max: number | null; deadline_days: number; status: OfferStatus; created_at: string; updated_at: string }
export type AccountsClientOfferInsert = { client_id: string; title: string; description: string; category?: OfferCategory; budget_min?: number | null; budget_max?: number | null; deadline_days?: number; status?: OfferStatus }
export type AccountsClientOfferUpdate = { title?: string; description?: string; category?: OfferCategory; budget_min?: number | null; budget_max?: number | null; deadline_days?: number; status?: OfferStatus }
export type CorePortfolioRow = { id: number; title: string; slug: string; description: string; category: PortfolioCategory; image: string; client_name: string; technologies: string; project_url: string; featured: boolean; created_at: string }
export type CorePortfolioInsert = { title: string; slug: string; description: string; category: PortfolioCategory; image: string; client_name: string; technologies: string; project_url?: string; featured?: boolean }
export type CorePortfolioUpdate = { title?: string; slug?: string; description?: string; category?: PortfolioCategory; image?: string; client_name?: string; technologies?: string; project_url?: string; featured?: boolean }
export type CoreTestimonialRow = { id: number; client_name: string; client_company: string; client_avatar: string; content: string; rating: number; verified: boolean; created_at: string }
export type CoreTestimonialInsert = { client_name: string; client_company?: string; client_avatar?: string; content: string; rating?: number; verified?: boolean }
export type CoreTestimonialUpdate = { client_name?: string; client_company?: string; client_avatar?: string; content?: string; rating?: number; verified?: boolean }
export type CoreContactMessageRow = { id: number; name: string; email: string; phone: string; subject: string; message: string; is_read: boolean; created_at: string }
export type CoreContactMessageInsert = { name: string; email: string; phone?: string; subject: string; message: string }
export type CoreContactMessageUpdate = { is_read?: boolean }
export type CoreServiceCategoryRow = { id: number; title: string; slug: string; description: string; short_description: string; icon: string; price: number | null; duration: string; features: string; order: number }
export type CoreServiceCategoryInsert = { title: string; slug: string; description: string; short_description: string; icon: string; price?: number | null; duration?: string; features: string; order?: number }
export type CoreServiceCategoryUpdate = { title?: string; slug?: string; description?: string; short_description?: string; icon?: string; price?: number | null; duration?: string; features?: string; order?: number }
export type ServicesServiceRow = { id: number; title: string; slug: string; description: string; category: OfferCategory; price: number; delivery_time_days: number; created_by_id: string | null; image: string | null; thumbnail_image: string | null; is_active: boolean; created_at: string; updated_at: string }
export type ServicesServiceInsert = { title: string; slug?: string; description: string; category?: OfferCategory; price: number; delivery_time_days?: number; created_by_id?: string | null; image?: string | null; thumbnail_image?: string | null; is_active?: boolean }
export type ServicesServiceUpdate = { title?: string; description?: string; category?: OfferCategory; price?: number; delivery_time_days?: number; image?: string | null; thumbnail_image?: string | null; is_active?: boolean }
export type ServicesClientRequestRow = { id: number; client_id: string; title: string; description: string; category: OfferCategory; budget: number; deadline: string; status: RequestStatus; created_at: string }
export type ServicesClientRequestInsert = { client_id: string; title: string; description: string; category?: OfferCategory; budget: number; deadline: string; status?: RequestStatus }
export type ServicesClientRequestUpdate = { title?: string; description?: string; category?: OfferCategory; budget?: number; deadline?: string; status?: RequestStatus }
export type FreelancersSkillRow = { id: number; name: string; slug: string }
export type FreelancersSkillInsert = { name: string; slug?: string }
export type FreelancersSkillUpdate = { name?: string }
export type FreelancersFreelancerProfileRow = { id: number; user_id: string; bio: string; hourly_rate: number | null; portfolio_url: string | null; avatar: string | null; linkedin_url: string | null; github_url: string | null; rating: number; available: boolean; created_at: string }
export type FreelancersFreelancerProfileInsert = { user_id: string; bio?: string; hourly_rate?: number | null; portfolio_url?: string | null; avatar?: string | null; linkedin_url?: string | null; github_url?: string | null; rating?: number; available?: boolean }
export type FreelancersFreelancerProfileUpdate = { bio?: string; hourly_rate?: number | null; portfolio_url?: string | null; avatar?: string | null; linkedin_url?: string | null; github_url?: string | null; rating?: number; available?: boolean }
export type FreelancersFreelancerProfileSkillsRow = { id: number; freelancerprofile_id: number; skill_id: number }
export type FreelancersFreelancerProfileSkillsInsert = { freelancerprofile_id: number; skill_id: number }
export type FreelancersFreelancerProfileSkillsUpdate = { freelancerprofile_id?: number; skill_id?: number }
export type OrdersOrderRow = { id: number; service_id: number; client_id: string; freelancer_id: string | null; status: OrderStatus; price: number; instructions: string; attachment: string | null; due_date: string | null; created_at: string; updated_at: string }
export type OrdersOrderInsert = { service_id: number; client_id: string; freelancer_id?: string | null; status?: OrderStatus; price: number; instructions?: string; attachment?: string | null; due_date?: string | null }
export type OrdersOrderUpdate = { freelancer_id?: string | null; status?: OrderStatus; instructions?: string; due_date?: string | null }
export type PaymentsPaymentRow = { id: number; order_id: number; amount: number; currency: string; provider: PaymentProvider; provider_transaction_id: string | null; provider_data: Json | null; status: PaymentStatus; released: boolean; created_at: string; updated_at: string }
export type PaymentsPaymentInsert = { order_id: number; amount: number; currency?: string; provider?: PaymentProvider; provider_transaction_id?: string | null; provider_data?: Json | null; status?: PaymentStatus; released?: boolean }
export type PaymentsPaymentUpdate = { provider_transaction_id?: string | null; provider_data?: Json | null; status?: PaymentStatus; released?: boolean }
