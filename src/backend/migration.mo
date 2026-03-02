import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import List "mo:core/List";
import Iter "mo:core/Iter";

module {
  type Employee = {
    id : Nat;
    name : Text;
    fatherName : Text;
    dateOfBirth : Text;
    gender : Text;
    aadhaarNumber : Text;
    panNumber : Text;
    mobileNumber : Text;
    email : Text;
    address : Text;
    department : Text;
    designation : Text;
    dateOfJoining : Text;
    salaryStructure : Text;
    bankAccountDetails : Text;
    ifscCode : Text;
    pfNumber : Text;
    esiNumber : Text;
    photo : Text;
    workName : Text;
    workSite : Text;
    employmentStatus : Text;
  };

  type Document = {
    id : Nat;
    employeeId : Nat;
    title : Text;
    category : Text;
    status : Text;
    uploadDate : Text;
    expiryDate : Text;
    fileType : Text;
  };

  type AdminUser = {
    id : Nat;
    email : Text;
    phone : Text;
    password : Text;
    status : Text;
  };

  type NewActor = {
    employees : Map.Map<Nat, Employee>;
    documents : Map.Map<Nat, Document>;
    adminUsers : Map.Map<Nat, AdminUser>;
    nextEmployeeId : Nat;
    nextDocumentId : Nat;
    nextAdminUserId : Nat;
  };

  public func run(new : NewActor) : NewActor {
    // No transformation needed since we keep data persistent
    new;
  };
};
