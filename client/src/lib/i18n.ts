import { createContext, useContext } from 'react';

export type Language = 'en' | 'id';

export interface Translations {
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    create: string;
    search: string;
    filter: string;
    export: string;
  };
  auth: {
    signIn: string;
    signOut: string;
    register: string;
    username: string;
    email: string;
    password: string;
    name: string;
    phone: string;
    address: string;
    loginFailed: string;
    registrationFailed: string;
    logoutFailed: string;
    signingIn: string;
    creatingAccount: string;
    welcomeBack: string;
  };
  navigation: {
    dashboard: string;
    customers: string;
    technicians: string;
    tickets: string;
    packages: string;
    network: string;
    settings: string;
    notifications: string;
  };
  dashboard: {
    overview: string;
    stats: string;
    totalCustomers: string;
    openTickets: string;
    monthlyRevenue: string;
    networkIssues: string;
    recentTickets: string;
    quickActions: string;
  };
  tickets: {
    ticket: string;
    tickets: string;
    newTicket: string;
    createTicket: string;
    ticketType: string;
    priority: string;
    title: string;
    description: string;
    status: string;
    customer: string;
    technician: string;
    created: string;
    completed: string;
    assign: string;
    assignTo: string;
    installation: string;
    repair: string;
    complaint: string;
    open: string;
    inProgress: string;
    low: string;
    normal: string;
    high: string;
    urgent: string;
  };
  customer: {
    customerPortal: string;
    serviceStatus: string;
    currentPlan: string;
    outstandingBills: string;
    recentBills: string;
    supportTickets: string;
    payBill: string;
    newCustomerRegistration: string;
    installationAddress: string;
    choosePackage: string;
    completeRegistration: string;
  };
  technician: {
    technicianPortal: string;
    pendingTasks: string;
    completedToday: string;
    assignedTasks: string;
    startTask: string;
    uploadPhotos: string;
    completionPhotos: string;
    gpsLocation: string;
    enabled: string;
    disabled: string;
    coordinates: string;
    uploadPhotoComplete: string;
  };
  network: {
    networkStatus: string;
    ftthNetwork: string;
    online: string;
    maintenance: string;
    offline: string;
    coverage: string;
    connectedCustomers: string;
    lastUpdate: string;
  };
  billing: {
    bills: string;
    bill: string;
    amount: string;
    dueDate: string;
    period: string;
    paid: string;
    pending: string;
    overdue: string;
    generateBills: string;
    monthlyBills: string;
    paymentProcessed: string;
  };
  chat: {
    title: string;
    newChat: string;
    ispSupport: string;
    welcomeMessage: string;
    typeMessage: string;
    noChatSelected: string;
    selectOrCreateChat: string;
    startNewChat: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
    },
    auth: {
      signIn: 'Sign In',
      signOut: 'Sign Out',
      register: 'Register',
      username: 'Username',
      email: 'Email',
      password: 'Password',
      name: 'Full Name',
      phone: 'Phone Number',
      address: 'Address',
      loginFailed: 'Login failed',
      registrationFailed: 'Registration failed',
      logoutFailed: 'Logout failed',
      signingIn: 'Signing In...',
      creatingAccount: 'Creating Account...',
      welcomeBack: 'Welcome back',
    },
    navigation: {
      dashboard: 'Dashboard',
      customers: 'Customers',
      technicians: 'Technicians',
      tickets: 'Tickets',
      packages: 'Packages',
      network: 'Network',
      settings: 'Settings',
      notifications: 'Notifications',
    },
    dashboard: {
      overview: 'Overview',
      stats: 'Statistics',
      totalCustomers: 'Total Customers',
      openTickets: 'Open Tickets',
      monthlyRevenue: 'Monthly Revenue',
      networkIssues: 'Network Issues',
      recentTickets: 'Recent Tickets',
      quickActions: 'Quick Actions',
    },
    tickets: {
      ticket: 'Ticket',
      tickets: 'Tickets',
      newTicket: 'New Ticket',
      createTicket: 'Create Ticket',
      ticketType: 'Ticket Type',
      priority: 'Priority',
      title: 'Title',
      description: 'Description',
      status: 'Status',
      customer: 'Customer',
      technician: 'Technician',
      created: 'Created',
      completed: 'Completed',
      assign: 'Assign',
      assignTo: 'Assign To',
      installation: 'Installation',
      repair: 'Repair',
      complaint: 'Complaint',
      open: 'Open',
      inProgress: 'In Progress',
      low: 'Low',
      normal: 'Normal',
      high: 'High',
      urgent: 'Urgent',
    },
    customer: {
      customerPortal: 'Customer Portal',
      serviceStatus: 'Service Status',
      currentPlan: 'Current Plan',
      outstandingBills: 'Outstanding Bills',
      recentBills: 'Recent Bills',
      supportTickets: 'Support Tickets',
      payBill: 'Pay',
      newCustomerRegistration: 'New Customer Registration',
      installationAddress: 'Installation Address',
      choosePackage: 'Choose Your Package',
      completeRegistration: 'Complete Registration',
    },
    technician: {
      technicianPortal: 'Technician Portal',
      pendingTasks: 'Pending Tasks',
      completedToday: 'Completed Today',
      assignedTasks: 'Assigned Tasks',
      startTask: 'Start Task',
      uploadPhotos: 'Upload Photos',
      completionPhotos: 'Upload Completion Photos',
      gpsLocation: 'GPS Location',
      enabled: 'Enabled',
      disabled: 'Disabled',
      coordinates: 'Coordinates',
      uploadPhotoComplete: 'Upload Photos & Complete Task',
    },
    network: {
      networkStatus: 'Network Status',
      ftthNetwork: 'FTTH Network Status',
      online: 'Online',
      maintenance: 'Maintenance',
      offline: 'Offline',
      coverage: 'Coverage',
      connectedCustomers: 'Connected Customers',
      lastUpdate: 'Last Update',
    },
    billing: {
      bills: 'Bills',
      bill: 'Bill',
      amount: 'Amount',
      dueDate: 'Due Date',
      period: 'Period',
      paid: 'Paid',
      pending: 'Pending',
      overdue: 'Overdue',
      generateBills: 'Generate Monthly Bills',
      monthlyBills: 'Monthly Bills',
      paymentProcessed: 'Payment Processed',
    },
    chat: {
      title: 'AI Assistant',
      newChat: 'New Chat',
      ispSupport: 'ISP Customer Support Assistant',
      welcomeMessage: 'Welcome! How can I help you today?',
      typeMessage: 'Type your message...',
      noChatSelected: 'No chat selected',
      selectOrCreateChat: 'Select a conversation or create a new one to get started',
      startNewChat: 'Start New Chat',
    },
  },
  id: {
    common: {
      loading: 'Memuat...',
      error: 'Kesalahan',
      success: 'Berhasil',
      cancel: 'Batal',
      save: 'Simpan',
      delete: 'Hapus',
      edit: 'Edit',
      create: 'Buat',
      search: 'Cari',
      filter: 'Filter',
      export: 'Ekspor',
    },
    auth: {
      signIn: 'Masuk',
      signOut: 'Keluar',
      register: 'Daftar',
      username: 'Nama Pengguna',
      email: 'Email',
      password: 'Kata Sandi',
      name: 'Nama Lengkap',
      phone: 'Nomor Telepon',
      address: 'Alamat',
      loginFailed: 'Login gagal',
      registrationFailed: 'Pendaftaran gagal',
      logoutFailed: 'Logout gagal',
      signingIn: 'Sedang Masuk...',
      creatingAccount: 'Membuat Akun...',
      welcomeBack: 'Selamat datang kembali',
    },
    navigation: {
      dashboard: 'Dasbor',
      customers: 'Pelanggan',
      technicians: 'Teknisi',
      tickets: 'Tiket',
      packages: 'Paket',
      network: 'Jaringan',
      settings: 'Pengaturan',
      notifications: 'Notifikasi',
    },
    dashboard: {
      overview: 'Ringkasan',
      stats: 'Statistik',
      totalCustomers: 'Total Pelanggan',
      openTickets: 'Tiket Terbuka',
      monthlyRevenue: 'Pendapatan Bulanan',
      networkIssues: 'Masalah Jaringan',
      recentTickets: 'Tiket Terbaru',
      quickActions: 'Aksi Cepat',
    },
    tickets: {
      ticket: 'Tiket',
      tickets: 'Tiket',
      newTicket: 'Tiket Baru',
      createTicket: 'Buat Tiket',
      ticketType: 'Jenis Tiket',
      priority: 'Prioritas',
      title: 'Judul',
      description: 'Deskripsi',
      status: 'Status',
      customer: 'Pelanggan',
      technician: 'Teknisi',
      created: 'Dibuat',
      completed: 'Selesai',
      assign: 'Tugaskan',
      assignTo: 'Tugaskan Kepada',
      installation: 'Instalasi',
      repair: 'Perbaikan',
      complaint: 'Keluhan',
      open: 'Terbuka',
      inProgress: 'Sedang Dikerjakan',
      low: 'Rendah',
      normal: 'Normal',
      high: 'Tinggi',
      urgent: 'Mendesak',
    },
    customer: {
      customerPortal: 'Portal Pelanggan',
      serviceStatus: 'Status Layanan',
      currentPlan: 'Paket Saat Ini',
      outstandingBills: 'Tagihan Tertunggak',
      recentBills: 'Tagihan Terbaru',
      supportTickets: 'Tiket Dukungan',
      payBill: 'Bayar',
      newCustomerRegistration: 'Pendaftaran Pelanggan Baru',
      installationAddress: 'Alamat Instalasi',
      choosePackage: 'Pilih Paket Anda',
      completeRegistration: 'Selesaikan Pendaftaran',
    },
    technician: {
      technicianPortal: 'Portal Teknisi',
      pendingTasks: 'Tugas Tertunda',
      completedToday: 'Selesai Hari Ini',
      assignedTasks: 'Tugas yang Ditugaskan',
      startTask: 'Mulai Tugas',
      uploadPhotos: 'Unggah Foto',
      completionPhotos: 'Unggah Foto Penyelesaian',
      gpsLocation: 'Lokasi GPS',
      enabled: 'Diaktifkan',
      disabled: 'Dinonaktifkan',
      coordinates: 'Koordinat',
      uploadPhotoComplete: 'Unggah Foto & Selesaikan Tugas',
    },
    network: {
      networkStatus: 'Status Jaringan',
      ftthNetwork: 'Status Jaringan FTTH',
      online: 'Online',
      maintenance: 'Pemeliharaan',
      offline: 'Offline',
      coverage: 'Cakupan',
      connectedCustomers: 'Pelanggan Terhubung',
      lastUpdate: 'Pembaruan Terakhir',
    },
    billing: {
      bills: 'Tagihan',
      bill: 'Tagihan',
      amount: 'Jumlah',
      dueDate: 'Tanggal Jatuh Tempo',
      period: 'Periode',
      paid: 'Dibayar',
      pending: 'Tertunda',
      overdue: 'Terlambat',
      generateBills: 'Buat Tagihan Bulanan',
      monthlyBills: 'Tagihan Bulanan',
      paymentProcessed: 'Pembayaran Diproses',
    },
    chat: {
      title: 'Asisten AI',
      newChat: 'Chat Baru',
      ispSupport: 'Asisten Dukungan Pelanggan ISP',
      welcomeMessage: 'Selamat datang! Bagaimana saya bisa membantu Anda hari ini?',
      typeMessage: 'Ketik pesan Anda...',
      noChatSelected: 'Tidak ada chat yang dipilih',
      selectOrCreateChat: 'Pilih percakapan atau buat yang baru untuk memulai',
      startNewChat: 'Mulai Chat Baru',
    },
  },
};

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

export const LanguageContext = createContext<LanguageContextType | null>(null);

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}