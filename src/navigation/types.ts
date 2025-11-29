export type RootStackParamList = {
  Loading: undefined;
  AuthStack: undefined;
  BottomTabs: undefined;
  Scanner: undefined;
  ReceiptProcessing: { qrCodeUrl: string };
  ReceiptDetail: { receiptId: string };
  CompareStores: undefined;
  Empacotador: { receiptId: string };
  Settings: undefined;
  ShoppingLists: undefined;
  ShoppingListDetails: { listId: string; receiptId?: string; syncReceipt?: boolean };
  ShoppingListExecutions: { listId: string };
  ExecutionReport: { executionId: string };
  CreateShoppingList: { listId?: string };
  SelectReceipt: { listId: string };
  Notifications: undefined;
  Profile: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  ShoppingLists: undefined;
  Scan: undefined;
  Products: undefined;
  Analytics: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

