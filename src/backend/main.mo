import Order "mo:core/Order";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Migration "migration";

(with migration = Migration.run)
actor {
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

  module Employee {
    public func compare(a : Employee, b : Employee) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module Document {
    public func compare(a : Document, b : Document) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module AdminUser {
    public func compare(a : AdminUser, b : AdminUser) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  var nextEmployeeId = 1;
  var nextDocumentId = 1;
  var nextAdminUserId = 1;

  let employees = Map.empty<Nat, Employee>();
  let documents = Map.empty<Nat, Document>();
  let adminUsers = Map.empty<Nat, AdminUser>();

  system func postupgrade() {
    // Dummy implementation for compatibility, real migration happens in with clause
  };

  // Improved init to only seed one default admin user if map is empty
  public shared ({ caller }) func init() : async () {
    // Only seed if admin users is empty
    switch (adminUsers.values().find(func(user) { user.email == "gokul.blackcatsolution@gmail.com" })) {
      // user not found, create it
      case (null) {
        let adminUser : AdminUser = {
          id = 1;
          email = "gokul.blackcatsolution@gmail.com";
          phone = "9999999999";
          password = "Admin@1234";
          status = "active";
        };
        adminUsers.add(adminUser.id, adminUser);
        nextAdminUserId := 2;
      };
      case (_) {};
    };
  };

  // Admin user functions
  public shared ({ caller }) func addAdminUser(email : Text, phone : Text, password : Text) : async Nat {
    let id = nextAdminUserId;
    let adminUser : AdminUser = {
      id;
      email;
      phone;
      password;
      status = "active";
    };
    adminUsers.add(id, adminUser);
    nextAdminUserId += 1;
    id;
  };

  public query ({ caller }) func getAdminUsers() : async [AdminUser] {
    adminUsers.values().toArray().sort();
  };

  public shared ({ caller }) func deleteAdminUser(id : Nat) : async () {
    switch (adminUsers.get(id)) {
      case (null) {
        Runtime.trap("Admin not found");
      };
      case (?adminUser) {
        if (adminUser.email == "gokul.blackcatsolution@gmail.com") {
          Runtime.trap("Cannot delete super admin");
        };
        adminUsers.remove(id);
      };
    };
  };

  public shared ({ caller }) func login(email : Text, password : Text) : async Bool {
    adminUsers.values().any(
      func(adminUser) {
        adminUser.email == email and adminUser.password == password and adminUser.status == "active"
      }
    );
  };

  public query ({ caller }) func getEmployees() : async [Employee] {
    employees.values().toArray().sort();
  };

  public query ({ caller }) func getDocuments() : async [Document] {
    documents.values().toArray().sort();
  };

  public query ({ caller }) func getDocumentsByEmployee(employeeId : Nat) : async [Document] {
    let filteredDocuments = documents.values().toArray().filter(
      func(doc) { doc.employeeId == employeeId }
    );
    filteredDocuments.sort();
  };

  public shared ({ caller }) func addEmployee(
    name : Text,
    fatherName : Text,
    dateOfBirth : Text,
    gender : Text,
    aadhaarNumber : Text,
    panNumber : Text,
    mobileNumber : Text,
    email : Text,
    address : Text,
    department : Text,
    designation : Text,
    dateOfJoining : Text,
    salaryStructure : Text,
    bankAccountDetails : Text,
    ifscCode : Text,
    pfNumber : Text,
    esiNumber : Text,
    photo : Text,
    workName : Text,
    workSite : Text,
    employmentStatus : Text,
  ) : async Nat {
    let id = nextEmployeeId;
    let employee : Employee = {
      id;
      name;
      fatherName;
      dateOfBirth;
      gender;
      aadhaarNumber;
      panNumber;
      mobileNumber;
      email;
      address;
      department;
      designation;
      dateOfJoining;
      salaryStructure;
      bankAccountDetails;
      ifscCode;
      pfNumber;
      esiNumber;
      photo;
      workName;
      workSite;
      employmentStatus;
    };
    employees.add(id, employee);
    nextEmployeeId := nextEmployeeId + 1;
    id;
  };

  public shared ({ caller }) func updateEmployee(
    employeeId : Nat,
    name : Text,
    fatherName : Text,
    dateOfBirth : Text,
    gender : Text,
    aadhaarNumber : Text,
    panNumber : Text,
    mobileNumber : Text,
    email : Text,
    address : Text,
    department : Text,
    designation : Text,
    dateOfJoining : Text,
    salaryStructure : Text,
    bankAccountDetails : Text,
    ifscCode : Text,
    pfNumber : Text,
    esiNumber : Text,
    photo : Text,
    workName : Text,
    workSite : Text,
    employmentStatus : Text,
  ) : async () {
    let employee = switch (employees.get(employeeId)) {
      case (null) {
        Runtime.trap("Employee does not exist");
      };
      case (?existing) { existing };
    };

    let updatedEmployee : Employee = {
      id = employeeId;
      name;
      fatherName;
      dateOfBirth;
      gender;
      aadhaarNumber;
      panNumber;
      mobileNumber;
      email;
      address;
      department;
      designation;
      dateOfJoining;
      salaryStructure;
      bankAccountDetails;
      ifscCode;
      pfNumber;
      esiNumber;
      photo;
      workName;
      workSite;
      employmentStatus;
    };

    employees.add(employeeId, updatedEmployee);
  };

  public shared ({ caller }) func deleteEmployee(employeeId : Nat) : async () {
    let employee = switch (employees.get(employeeId)) {
      case (null) {
        Runtime.trap("Employee does not exist");
      };
      case (?existing) { existing };
    };

    employees.remove(employeeId);

    let docsToRemove = documents.entries().filter(func((id, doc)) { doc.employeeId == employeeId }).toArray();
    for ((id, doc) in docsToRemove.values()) {
      documents.remove(id);
    };
  };

  public shared ({ caller }) func updateEmployeeStatus(employeeId : Nat, status : Text) : async () {
    let employee = switch (employees.get(employeeId)) {
      case (null) {
        Runtime.trap("Employee does not exist");
      };
      case (?existingEmployee) { existingEmployee };
    };
    let updatedEmployee = { employee with employmentStatus = status };
    employees.add(employeeId, updatedEmployee);
  };

  public shared ({ caller }) func addDocument(
    employeeId : Nat,
    title : Text,
    category : Text,
    status : Text,
    uploadDate : Text,
    expiryDate : Text,
    fileType : Text,
  ) : async Nat {
    if (not employees.containsKey(employeeId)) {
      Runtime.trap("Employee not found");
    };

    let id = nextDocumentId;
    let doc : Document = {
      id;
      employeeId;
      title;
      category;
      status;
      uploadDate;
      expiryDate;
      fileType;
    };

    documents.add(id, doc);
    nextDocumentId := nextDocumentId + 1;
    id;
  };

  public shared ({ caller }) func updateDocumentStatus(documentId : Nat, status : Text) : async () {
    let doc = switch (documents.get(documentId)) {
      case (null) {
        Runtime.trap("Document does not exist");
      };
      case (?existingDoc) { existingDoc };
    };

    let updatedDoc = { doc with status };
    documents.add(documentId, updatedDoc);
  };

  public shared ({ caller }) func deleteDocument(documentId : Nat) : async () {
    let doc = switch (documents.get(documentId)) {
      case (null) {
        Runtime.trap("Document does not exist");
      };
      case (?existing) { existing };
    };

    documents.remove(documentId);
  };
};
