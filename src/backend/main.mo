import Order "mo:core/Order";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Iter "mo:core/Iter";



actor {
  // Type definitions
  type Employee = {
    id : Nat;
    name : Text;
    aadhaarNumber : Text;
    photo : Text;
    designation : Text;
    workName : Text;
    workSite : Text;
    employmentStatus : Text;
    email : Text;
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

  public shared ({ caller }) func init() : async () {
    clearData();

    // Seed one default admin user
    let adminUser : AdminUser = {
      id = 1;
      email = "admin@example.com";
      phone = "9999999999";
      password = "Admin@1234";
    };
    adminUsers.add(adminUser.id, adminUser);
    nextAdminUserId := 2;

    // Seed employees
    let seedEmployees : [Employee] = [
      {
        id = 1;
        name = "Ramesh Kumar";
        aadhaarNumber = "1234-5678-9012";
        photo = "ramesh_photo.jpeg";
        designation = "Engineer";
        workName = "Acme Construction";
        workSite = "Site A";
        employmentStatus = "Active";
        email = "Ramesh@example.com";
      },
      {
        id = 2;
        name = "Priya Singh";
        aadhaarNumber = "2345-6789-0123";
        photo = "priya_photo.jpeg";
        designation = "Supervisor";
        workName = "Bridge Works";
        workSite = "Site B";
        employmentStatus = "Active";
        email = "Priya@example.com";
      },
      {
        id = 3;
        name = "Suresh Patel";
        aadhaarNumber = "3456-7890-1234";
        photo = "suresh_photo.jpeg";
        designation = "Foreman";
        workName = "Road Division";
        workSite = "North Zone";
        employmentStatus = "Active";
        email = "Suresh@example.com";
      },
      {
        id = 4;
        name = "Anjali Verma";
        aadhaarNumber = "4567-8901-2345";
        photo = "anjali_photo.jpeg";
        designation = "Engineer";
        workName = "Acme Construction";
        workSite = "Site A";
        employmentStatus = "Active";
        email = "Anjali@example.com";
      },
      {
        id = 5;
        name = "Vinod Sharma";
        aadhaarNumber = "5678-9012-3456";
        photo = "vinod_photo.jpeg";
        designation = "Supervisor";
        workName = "Bridge Works";
        workSite = "Site B";
        employmentStatus = "Active";
        email = "Vinod@example.com";
      },
      {
        id = 6;
        name = "Sunita Joshi";
        aadhaarNumber = "6789-0123-4567";
        photo = "sunita_photo.jpeg";
        designation = "Engineer";
        workName = "Road Division";
        workSite = "North Zone";
        employmentStatus = "Active";
        email = "Sunita@example.com";
      },
      {
        id = 7;
        name = "Rajeev Kumar";
        aadhaarNumber = "7890-1234-5678";
        photo = "rajeev_photo.jpeg";
        designation = "Supervisor";
        workName = "Acme Construction";
        workSite = "Site A";
        employmentStatus = "Active";
        email = "Rajeev@example.com";
      },
      {
        id = 8;
        name = "Meena Gupta";
        aadhaarNumber = "8901-2345-6789";
        photo = "meena_photo.jpeg";
        designation = "Foreman";
        workName = "Bridge Works";
        workSite = "Site B";
        employmentStatus = "Active";
        email = "Meena@example.com";
      },
      {
        id = 9;
        name = "Vijay Rao";
        aadhaarNumber = "9012-3456-7890";
        photo = "vijay_photo.jpeg";
        designation = "Engineer";
        workName = "Road Division";
        workSite = "North Zone";
        employmentStatus = "Left";
        email = "Vijay@example.com";
      },
      {
        id = 10;
        name = "Kavita Menon";
        aadhaarNumber = "0123-4567-8901";
        photo = "kavita_photo.jpeg";
        designation = "Supervisor";
        workName = "Acme Construction";
        workSite = "Site A";
        employmentStatus = "Left";
        email = "Kavita@example.com";
      },
    ];

    for (employee in seedEmployees.values()) {
      employees.add(employee.id, employee);
      if (employee.id >= nextEmployeeId) {
        nextEmployeeId := employee.id + 1;
      };
    };

    // Seed documents for each employee
    let seedDocuments : [Document] = [
      {
        id = 1;
        employeeId = 1;
        title = "Offer Letter";
        category = "Offer Letter";
        status = "Approved";
        uploadDate = "2021-12-01";
        expiryDate = "";
        fileType = "pdf";
      },
      {
        id = 2;
        employeeId = 1;
        title = "ID Proof";
        category = "ID Proof";
        status = "Active";
        uploadDate = "2022-01-01";
        expiryDate = "2025-01-01";
        fileType = "pdf";
      },
      {
        id = 3;
        employeeId = 2;
        title = "Contract";
        category = "Contract";
        status = "Pending";
        uploadDate = "2023-03-15";
        expiryDate = "";
        fileType = "pdf";
      },
      {
        id = 4;
        employeeId = 2;
        title = "ID Proof";
        category = "ID Proof";
        status = "Active";
        uploadDate = "2022-03-01";
        expiryDate = "2026-03-01";
        fileType = "img";
      },
      {
        id = 5;
        employeeId = 3;
        title = "Payslip Jan 2023";
        category = "Payslip";
        status = "Active";
        uploadDate = "2023-02-01";
        expiryDate = "";
        fileType = "pdf";
      },
      {
        id = 6;
        employeeId = 4;
        title = "Certificate";
        category = "Certificate";
        status = "Approved";
        uploadDate = "2022-06-01";
        expiryDate = "";
        fileType = "pdf";
      },
      {
        id = 7;
        employeeId = 5;
        title = "Contract";
        category = "Contract";
        status = "Expired";
        uploadDate = "2021-10-01";
        expiryDate = "2022-10-01";
        fileType = "doc";
      },
      {
        id = 8;
        employeeId = 6;
        title = "ID Proof";
        category = "ID Proof";
        status = "Active";
        uploadDate = "2022-05-01";
        expiryDate = "2025-05-01";
        fileType = "img";
      },
      {
        id = 9;
        employeeId = 7;
        title = "Tax Form 2022";
        category = "Tax Form";
        status = "Approved";
        uploadDate = "2022-12-01";
        expiryDate = "";
        fileType = "pdf";
      },
      {
        id = 10;
        employeeId = 8;
        title = "Certificate";
        category = "Certificate";
        status = "Active";
        uploadDate = "2022-08-01";
        expiryDate = "";
        fileType = "pdf";
      },
      {
        id = 11;
        employeeId = 9;
        title = "Offer Letter";
        category = "Offer Letter";
        status = "Approved";
        uploadDate = "2022-11-01";
        expiryDate = "";
        fileType = "pdf";
      },
      {
        id = 12;
        employeeId = 10;
        title = "ID Proof";
        category = "ID Proof";
        status = "Active";
        uploadDate = "2022-02-01";
        expiryDate = "2025-02-01";
        fileType = "pdf";
      },
    ];

    for (document in seedDocuments.values()) {
      documents.add(document.id, document);
      if (document.id >= nextDocumentId) {
        nextDocumentId := document.id + 1;
      };
    };
  };

  func clearData() {
    employees.clear();
    documents.clear();
    adminUsers.clear();
    nextEmployeeId := 1;
    nextDocumentId := 1;
    nextAdminUserId := 1;
  };

  // Admin user functions
  public shared ({ caller }) func addAdminUser(email : Text, phone : Text, password : Text) : async Nat {
    let id = nextAdminUserId;
    let adminUser : AdminUser = { id; email; phone; password };
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
      case (?_adminUser) {
        adminUsers.remove(id);
      };
    };
  };

  public shared ({ caller }) func login(email : Text, phone : Text, password : Text) : async Bool {
    adminUsers.values().any(
      func(adminUser) {
        adminUser.email == email and adminUser.phone == phone and adminUser.password == password
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
    aadhaarNumber : Text,
    photo : Text,
    designation : Text,
    workName : Text,
    workSite : Text,
    employmentStatus : Text,
    email : Text,
  ) : async Nat {
    let id = nextEmployeeId;
    let employee : Employee = {
      id;
      name;
      aadhaarNumber;
      photo;
      designation;
      workName;
      workSite;
      employmentStatus;
      email;
    };
    employees.add(id, employee);
    nextEmployeeId := nextEmployeeId + 1;
    id;
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
    if (not documents.containsKey(documentId)) {
      Runtime.trap("Document does not exist");
    };
    documents.remove(documentId);
  };
};

