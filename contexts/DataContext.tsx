
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, Meeting, LearningContent, DashboardStats, InsuranceContract, MeetingRecord } from '@/types';

interface DataContextType {
  customers: Customer[];
  meetings: Meeting[];
  learningContent: LearningContent[];
  dashboardStats: DashboardStats;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addMeeting: (meeting: Omit<Meeting, 'id' | 'createdAt'>) => void;
  addLearningContent: (content: Omit<LearningContent, 'id' | 'createdAt'>) => void;
  checkPhoneNumberExists: (phoneNumber: string, excludeId?: string) => boolean;
  checkContractNumberExists: (contractNumber: string, excludeId?: string) => boolean;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [learningContent, setLearningContent] = useState<LearningContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = () => {
    // Demo data for testing
    const demoCustomers: Customer[] = [
      {
        id: '1',
        fullName: 'Nguyễn Văn An',
        phoneNumber: '0901234567',
        dateOfBirth: new Date('1985-05-15'),
        address: {
          commune: 'Phường Tân Định',
          district: 'Quận 1',
          city: 'TP. Hồ Chí Minh',
        },
        occupation: 'Kỹ sư',
        financialStatus: 'Thu nhập ổn định 20-30 triệu/tháng',
        familyInfo: 'Đã kết hôn, có 2 con',
        classification: 'Signed',
        hasInsurance: true,
        insuranceContracts: [
          {
            id: '1',
            company: 'Prudential Việt Nam',
            contractNumber: 'PRU001234',
            policyDetails: 'Bảo hiểm nhân thọ 20 năm, quyền lợi 500 triệu',
            joinDate: new Date('2023-01-15'),
            premiumAmounts: '5000000',
            paymentFrequency: 'month',
            nextPaymentDate: new Date('2024-02-15'),
          },
        ],
        meetingRecords: [
          {
            id: '1',
            date: new Date('2023-01-10'),
            notes: 'Gặp lần đầu, tư vấn về bảo hiểm nhân thọ',
            createdAt: new Date('2023-01-10'),
          },
          {
            id: '2',
            date: new Date('2023-01-14'),
            notes: 'Khách hàng đồng ý ký hợp đồng',
            createdAt: new Date('2023-01-14'),
          },
        ],
        files: [],
        createdBy: '1',
        createdAt: new Date('2023-01-10'),
        updatedAt: new Date('2023-01-10'),
      },
      {
        id: '2',
        fullName: 'Trần Thị Bình',
        phoneNumber: '0912345678',
        dateOfBirth: new Date('1990-08-20'),
        address: {
          commune: 'Xã Tân Phú Trung',
          district: 'Huyện Củ Chi',
          city: 'TP. Hồ Chí Minh',
        },
        occupation: 'Giáo viên',
        financialStatus: 'Thu nhập 15 triệu/tháng',
        familyInfo: 'Độc thân',
        classification: 'Potential',
        hasInsurance: false,
        insuranceContracts: [],
        meetingRecords: [
          {
            id: '1',
            date: new Date('2024-01-25'),
            notes: 'Quan tâm đến gói bảo hiểm sức khỏe',
            createdAt: new Date('2024-01-25'),
          },
        ],
        files: [],
        createdBy: '1',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: '3',
        fullName: 'Lê Minh Cường',
        phoneNumber: '0923456789',
        dateOfBirth: new Date('1988-03-10'),
        address: {
          district: 'Quận 3',
          city: 'TP. Hồ Chí Minh',
        },
        occupation: 'Kinh doanh',
        classification: 'Dropped',
        hasInsurance: false,
        insuranceContracts: [],
        meetingRecords: [],
        files: [],
        createdBy: '1',
        createdAt: new Date('2023-12-01'),
        updatedAt: new Date('2024-01-05'),
      },
    ];

    const demoLearning: LearningContent[] = [
      {
        id: '1',
        title: 'Kỹ năng tư vấn bảo hiểm hiệu quả',
        description: 'Học cách tiếp cận và tư vấn khách hàng một cách chuyên nghiệp',
        type: 'video',
        url: 'https://example.com/video1',
        thumbnailUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400',
        createdBy: '1',
        createdAt: new Date('2024-01-01'),
      },
      {
        id: '2',
        title: 'Thông báo: Chính sách mới 2024',
        description: 'Cập nhật các chính sách và quy định mới trong năm 2024',
        type: 'announcement',
        createdBy: '1',
        createdAt: new Date('2024-01-10'),
      },
      {
        id: '3',
        title: 'Kỹ thuật chốt sale hiệu quả',
        description: 'Các phương pháp và kỹ thuật để chốt hợp đồng thành công',
        type: 'video',
        url: 'https://example.com/video2',
        thumbnailUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
        createdBy: '1',
        createdAt: new Date('2024-01-05'),
      },
    ];

    setCustomers(demoCustomers);
    setLearningContent(demoLearning);
    setIsLoading(false);
  };

  const calculateDashboardStats = (): DashboardStats => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      totalCustomers: customers.length,
      signedCount: customers.filter(c => c.classification === 'Signed').length,
      potentialCount: customers.filter(c => c.classification === 'Potential').length,
      droppedCount: customers.filter(c => c.classification === 'Dropped').length,
      upcomingMeetings: customers.filter(c => 
        c.meetingRecords.some(m => m.date > now)
      ).length,
      upcomingPayments: customers.filter(c => 
        c.insuranceContracts.some(d => d.nextPaymentDate > now)
      ).length,
      newCustomersThisMonth: customers.filter(c => c.createdAt >= startOfMonth).length,
    };
  };

  const checkPhoneNumberExists = (phoneNumber: string, excludeId?: string): boolean => {
    return customers.some(c => c.phoneNumber === phoneNumber && c.id !== excludeId);
  };

  const checkContractNumberExists = (contractNumber: string, excludeId?: string): boolean => {
    return customers.some(c => 
      c.insuranceContracts.some(contract => 
        contract.contractNumber === contractNumber
      ) && c.id !== excludeId
    );
  };

  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCustomers([...customers, newCustomer]);
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(customers.map(c => 
      c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
    ));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
  };

  const addMeeting = (meeting: Omit<Meeting, 'id' | 'createdAt'>) => {
    const newMeeting: Meeting = {
      ...meeting,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setMeetings([...meetings, newMeeting]);
  };

  const addLearningContent = (content: Omit<LearningContent, 'id' | 'createdAt'>) => {
    const newContent: LearningContent = {
      ...content,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setLearningContent([...learningContent, newContent]);
  };

  return (
    <DataContext.Provider
      value={{
        customers,
        meetings,
        learningContent,
        dashboardStats: calculateDashboardStats(),
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addMeeting,
        addLearningContent,
        checkPhoneNumberExists,
        checkContractNumberExists,
        isLoading,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
