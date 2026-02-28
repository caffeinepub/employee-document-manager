import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Document {
    id: bigint;
    status: string;
    title: string;
    expiryDate: string;
    fileType: string;
    employeeId: bigint;
    category: string;
    uploadDate: string;
}
export interface Employee {
    id: bigint;
    workName: string;
    workSite: string;
    name: string;
    designation: string;
    email: string;
    aadhaarNumber: string;
    photo: string;
    employmentStatus: string;
}
export interface AdminUser {
    id: bigint;
    password: string;
    email: string;
    phone: string;
}
export interface backendInterface {
    addAdminUser(email: string, phone: string, password: string): Promise<bigint>;
    addDocument(employeeId: bigint, title: string, category: string, status: string, uploadDate: string, expiryDate: string, fileType: string): Promise<bigint>;
    addEmployee(name: string, aadhaarNumber: string, photo: string, designation: string, workName: string, workSite: string, employmentStatus: string, email: string): Promise<bigint>;
    deleteAdminUser(id: bigint): Promise<void>;
    deleteDocument(documentId: bigint): Promise<void>;
    deleteEmployee(employeeId: bigint): Promise<void>;
    getAdminUsers(): Promise<Array<AdminUser>>;
    getDocuments(): Promise<Array<Document>>;
    getDocumentsByEmployee(employeeId: bigint): Promise<Array<Document>>;
    getEmployees(): Promise<Array<Employee>>;
    init(): Promise<void>;
    login(email: string, phone: string, password: string): Promise<boolean>;
    updateDocumentStatus(documentId: bigint, status: string): Promise<void>;
    updateEmployee(employeeId: bigint, name: string, aadhaarNumber: string, photo: string, designation: string, workName: string, workSite: string, employmentStatus: string, email: string): Promise<void>;
    updateEmployeeStatus(employeeId: bigint, status: string): Promise<void>;
}
