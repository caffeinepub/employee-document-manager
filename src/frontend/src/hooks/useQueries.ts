import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Document, Employee } from "../backend.d.ts";
import { useActor } from "./useActor";

export type { Employee, Document };

export function useEmployees() {
  const { actor, isFetching } = useActor();
  return useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEmployees();
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 5,
  });
}

export function useDocuments() {
  const { actor, isFetching } = useActor();
  return useQuery<Document[]>({
    queryKey: ["documents"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDocuments();
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAddEmployee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: Omit<Employee, "id">) => {
      if (!actor) throw new Error("No actor available");
      return actor.addEmployee(
        params.name,
        params.fatherName,
        params.dateOfBirth,
        params.gender,
        params.aadhaarNumber,
        params.panNumber,
        params.mobileNumber,
        params.email,
        params.address,
        params.department,
        params.designation,
        params.dateOfJoining,
        params.salaryStructure,
        params.bankAccountDetails,
        params.ifscCode,
        params.pfNumber,
        params.esiNumber,
        params.photo,
        params.workName,
        params.workSite,
        params.employmentStatus,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useUpdateEmployeeStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { employeeId: bigint; status: string }) => {
      if (!actor) throw new Error("No actor available");
      return actor.updateEmployeeStatus(params.employeeId, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useAddDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      employeeId: bigint;
      title: string;
      category: string;
      status: string;
      uploadDate: string;
      expiryDate: string;
      fileType: string;
    }) => {
      if (!actor) throw new Error("No actor available");
      return actor.addDocument(
        params.employeeId,
        params.title,
        params.category,
        params.status,
        params.uploadDate,
        params.expiryDate,
        params.fileType,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useDeleteDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (documentId: bigint) => {
      if (!actor) throw new Error("No actor available");
      return actor.deleteDocument(documentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useUpdateDocumentStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { documentId: bigint; status: string }) => {
      if (!actor) throw new Error("No actor available");
      return actor.updateDocumentStatus(params.documentId, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useUpdateEmployee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      params: { employeeId: bigint } & Omit<Employee, "id">,
    ) => {
      if (!actor) throw new Error("No actor available");
      return actor.updateEmployee(
        params.employeeId,
        params.name,
        params.fatherName,
        params.dateOfBirth,
        params.gender,
        params.aadhaarNumber,
        params.panNumber,
        params.mobileNumber,
        params.email,
        params.address,
        params.department,
        params.designation,
        params.dateOfJoining,
        params.salaryStructure,
        params.bankAccountDetails,
        params.ifscCode,
        params.pfNumber,
        params.esiNumber,
        params.photo,
        params.workName,
        params.workSite,
        params.employmentStatus,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useDeleteEmployee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (employeeId: bigint) => {
      if (!actor) throw new Error("No actor available");
      return actor.deleteEmployee(employeeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}
