
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Customer, Meeting, LearningContent, DashboardStats, CustomerReminder, User } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DataContextType {
  customers: Customer[];
  meetings: Meeting[];
  learningContent: LearningContent[];
  users: User[];
  dashboardStats: DashboardStats;
  reminders: CustomerReminder[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addMeeting: (meeting: Omit<Meeting, 'id' | 'createdAt'>) => Promise<void>;
  addLearningContent: (content: Omit<LearningContent, 'id' | 'createdAt'>) => Promise<void>;
  updateLearningContent: (id: string, content: Partial<LearningContent>) => Promise<void>;
  deleteLearningContent: (id: string) => Promise<void>;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  checkPhoneNumberExists: (phoneNumber: string, excludeId?: string) => boolean;
  checkContractNumberExists: (contractNumber: string, excludeId?: string) => boolean;
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const CUSTOMERS_KEY = '@customers_data';
const LEARNING_KEY = '@learning_data';
const USERS_KEY = '@users_data';

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [learningContent, setLearningContent] = useState<LearningContent[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Use refs to track ongoing operations
  const operationQueue = useRef<Map<string, Promise<any>>>(new Map());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('Loading data from AsyncStorage...');
      const [customersData, learningData, usersData] = await Promise.all([
        AsyncStorage.getItem(CUSTOMERS_KEY),
        AsyncStorage.getItem(LEARNING_KEY),
        AsyncStorage.getItem(USERS_KEY),
      ]);

      if (customersData) {
        const parsedCustomers = JSON.parse(customersData);
        setCustomers(parsedCustomers.map((c: any) => ({
          ...c,
          dateOfBirth: new Date(c.dateOfBirth),
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
          meetingRecords: c.meetingRecords.map((m: any) => ({
            ...m,
            date: new Date(m.date),
            createdAt: new Date(m.createdAt),
          })),
          insuranceContracts: c.insuranceContracts.map((ic: any) => ({
            ...ic,
            joinDate: new Date(ic.joinDate),
            nextPaymentDate: new Date(ic.nextPaymentDate),
          })),
        })));
        console.log('Loaded customers:', parsedCustomers.length);
      }

      if (learningData) {
        const parsedLearning = JSON.parse(learningData);
        setLearningContent(parsedLearning.map((l: any) => ({
          ...l,
          createdAt: new Date(l.createdAt),
        })));
        console.log('Loaded learning content:', parsedLearning.length);
      }

      if (usersData) {
        const parsedUsers = JSON.parse(usersData);
        setUsers(parsedUsers.map((u: any) => ({
          ...u,
          createdAt: new Date(u.createdAt),
          updatedAt: u.updatedAt ? new Date(u.updatedAt) : undefined,
        })));
        console.log('Loaded users:', parsedUsers.length);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    console.log('Refreshing data...');
    await loadData();
  };

  const queueOperation = async <T,>(lockKey: string, operation: () => Promise<T>): Promise<T> => {
    // If operation is already running, wait for it
    if (operationQueue.current.has(lockKey)) {
      console.log(`Operation ${lockKey} already in progress, waiting...`);
      await operationQueue.current.get(lockKey);
    }

    // Start new operation
    console.log(`Starting operation ${lockKey}`);
    const promise = operation();
    operationQueue.current.set(lockKey, promise);

    try {
      const result = await promise;
      console.log(`Operation ${lockKey} completed successfully`);
      return result;
    } catch (error) {
      console.error(`Operation ${lockKey} failed:`, error);
      throw error;
    } finally {
      operationQueue.current.delete(lockKey);
      console.log(`Operation ${lockKey} cleaned up`);
    }
  };

  const saveCustomers = async (data: Customer[]) => {
    try {
      console.log('Saving customers to AsyncStorage:', data.length);
      await AsyncStorage.setItem(CUSTOMERS_KEY, JSON.stringify(data));
      setCustomers(data);
      console.log('Customers saved successfully');
    } catch (error) {
      console.error('Error saving customers:', error);
      throw error;
    }
  };

  const saveLearningContent = async (data: LearningContent[]) => {
    try {
      console.log('Saving learning content to AsyncStorage:', data.length);
      await AsyncStorage.setItem(LEARNING_KEY, JSON.stringify(data));
      setLearningContent(data);
      console.log('Learning content saved successfully');
    } catch (error) {
      console.error('Error saving learning content:', error);
      throw error;
    }
  };

  const saveUsers = async (data: User[]) => {
    try {
      console.log('Saving users to AsyncStorage:', data.length);
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(data));
      setUsers(data);
      console.log('Users saved successfully');
    } catch (error) {
      console.error('Error saving users:', error);
      throw error;
    }
  };

  const calculateReminders = (): CustomerReminder[] => {
    const reminders: CustomerReminder[] = [];
    const now = new Date();

    customers.forEach(customer => {
      // Birthday reminders (5 days)
      const birthday = new Date(customer.dateOfBirth);
      const thisYearBirthday = new Date(now.getFullYear(), birthday.getMonth(), birthday.getDate());
      const nextYearBirthday = new Date(now.getFullYear() + 1, birthday.getMonth(), birthday.getDate());
      
      const upcomingBirthday = thisYearBirthday >= now ? thisYearBirthday : nextYearBirthday;
      const daysUntilBirthday = Math.ceil((upcomingBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilBirthday >= 0 && daysUntilBirthday <= 5) {
        reminders.push({
          customerId: customer.id,
          customerName: customer.fullName,
          type: 'birthday',
          daysUntil: daysUntilBirthday,
          date: upcomingBirthday,
          message: `Còn ${daysUntilBirthday} ngày nữa tới sinh nhật`,
        });
      }

      // Payment reminders
      customer.insuranceContracts.forEach(contract => {
        const nextPayment = new Date(contract.nextPaymentDate);
        const daysUntilPayment = Math.ceil((nextPayment.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilPayment < 0) {
          const daysOverdue = Math.abs(daysUntilPayment);
          reminders.push({
            customerId: customer.id,
            customerName: customer.fullName,
            type: 'payment-overdue',
            daysOverdue: daysOverdue,
            date: nextPayment,
            message: `Đã trễ phí ${daysOverdue} ngày - ${contract.company}`,
          });
        } else if (daysUntilPayment >= 0 && daysUntilPayment <= 30) {
          reminders.push({
            customerId: customer.id,
            customerName: customer.fullName,
            type: 'payment-due',
            daysUntil: daysUntilPayment,
            date: nextPayment,
            message: `Còn ${daysUntilPayment} ngày nữa tới hạn đóng phí - ${contract.company}`,
          });
        }
      });
    });

    return reminders.sort((a, b) => {
      if (a.type === 'payment-overdue' && b.type !== 'payment-overdue') return -1;
      if (a.type !== 'payment-overdue' && b.type === 'payment-overdue') return 1;
      
      const aDays = a.daysOverdue || a.daysUntil || 0;
      const bDays = b.daysOverdue || b.daysUntil || 0;
      return aDays - bDays;
    });
  };

  const calculateDashboardStats = (): DashboardStats => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const reminders = calculateReminders();

    return {
      totalCustomers: customers.length,
      signedCount: customers.filter(c => c.classification === 'Signed').length,
      potentialCount: customers.filter(c => c.classification === 'Potential').length,
      droppedCount: customers.filter(c => c.classification === 'Dropped').length,
      upcomingMeetings: customers.filter(c => 
        c.meetingRecords.some(m => m.date > now)
      ).length,
      upcomingPayments: reminders.filter(r => r.type === 'payment-due').length,
      newCustomersThisMonth: customers.filter(c => c.createdAt >= startOfMonth).length,
      upcomingBirthdays: reminders.filter(r => r.type === 'birthday').length,
      overduePayments: reminders.filter(r => r.type === 'payment-overdue').length,
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

  const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    return queueOperation('add-customer', async () => {
      const newCustomer: Customer = {
        ...customer,
        id: `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      console.log('Adding new customer:', newCustomer.id);
      await saveCustomers([...customers, newCustomer]);
    });
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    return queueOperation(`update-customer-${id}`, async () => {
      console.log('Updating customer:', id);
      const updated = customers.map(c => 
        c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
      );
      await saveCustomers(updated);
    });
  };

  const deleteCustomer = async (id: string) => {
    return queueOperation(`delete-customer-${id}`, async () => {
      console.log('Deleting customer:', id);
      await saveCustomers(customers.filter(c => c.id !== id));
    });
  };

  const addMeeting = async (meeting: Omit<Meeting, 'id' | 'createdAt'>) => {
    return queueOperation('add-meeting', async () => {
      const newMeeting: Meeting = {
        ...meeting,
        id: `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
      };
      console.log('Adding new meeting:', newMeeting.id);
      setMeetings([...meetings, newMeeting]);
    });
  };

  const addLearningContent = async (content: Omit<LearningContent, 'id' | 'createdAt'>) => {
    return queueOperation('add-learning', async () => {
      const newContent: LearningContent = {
        ...content,
        id: `learning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
      };
      console.log('Adding new learning content:', newContent.id);
      await saveLearningContent([...learningContent, newContent]);
    });
  };

  const updateLearningContent = async (id: string, updates: Partial<LearningContent>) => {
    return queueOperation(`update-learning-${id}`, async () => {
      console.log('Updating learning content:', id);
      const updated = learningContent.map(l => 
        l.id === id ? { ...l, ...updates } : l
      );
      await saveLearningContent(updated);
    });
  };

  const deleteLearningContent = async (id: string) => {
    return queueOperation(`delete-learning-${id}`, async () => {
      console.log('Deleting learning content:', id);
      await saveLearningContent(learningContent.filter(l => l.id !== id));
    });
  };

  const addUser = async (user: Omit<User, 'id' | 'createdAt'>) => {
    return queueOperation('add-user', async () => {
      const newUser: User = {
        ...user,
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
      };
      console.log('Adding new user:', newUser.id);
      await saveUsers([...users, newUser]);
    });
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    return queueOperation(`update-user-${id}`, async () => {
      console.log('Updating user:', id);
      const updated = users.map(u => 
        u.id === id ? { ...u, ...updates, updatedAt: new Date() } : u
      );
      await saveUsers(updated);
    });
  };

  const deleteUser = async (id: string) => {
    return queueOperation(`delete-user-${id}`, async () => {
      console.log('Deleting user:', id);
      await saveUsers(users.filter(u => u.id !== id));
    });
  };

  return (
    <DataContext.Provider
      value={{
        customers,
        meetings,
        learningContent,
        users,
        dashboardStats: calculateDashboardStats(),
        reminders: calculateReminders(),
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addMeeting,
        addLearningContent,
        updateLearningContent,
        deleteLearningContent,
        addUser,
        updateUser,
        deleteUser,
        checkPhoneNumberExists,
        checkContractNumberExists,
        isLoading,
        refreshData,
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
