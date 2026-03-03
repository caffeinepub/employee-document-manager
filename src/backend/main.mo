import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Array "mo:core/Array";


// Use migration module for upgrades

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
    fileUrl : Text;
  };

  type AdminUser = {
    id : Nat;
    email : Text;
    phone : Text;
    password : Text;
    name : Text;
    status : Text;
  };

  type LoginResult = {
    #ok;
    #invalidCredentials;
    #accountInactive;
  };

  let rootAdminId = 1;
  let rootAdminEmail = "gokul.blackcatsolution@gmail.com";
  let rootAdminPhone = "9999999999";
  let rootAdminPassword = "Admin@1234";
  let rootAdminName = "Gokul";

  stable var nextEmployeeId = 1;
  stable var nextDocumentId = 1;
  stable var nextAdminUserId = 2; // Start at 2 to prevent overwriting root admin id

  stable var employees : [(Nat, Employee)] = [];
  stable var documents : [(Nat, Document)] = [];
  stable var adminUsers : [(Nat, AdminUser)] = [];

  var employeesMap : Map.Map<Nat, Employee> = Map.empty<Nat, Employee>();
  var documentsMap : Map.Map<Nat, Document> = Map.empty<Nat, Document>();
  var adminUsersMap : Map.Map<Nat, AdminUser> = Map.empty<Nat, AdminUser>();

  private func syncStableWithMaps() {
    employees := employeesMap.toArray();
    documents := documentsMap.toArray();
    adminUsers := adminUsersMap.toArray();
  };

  private func initializeMapFromStable<T>(
    stableArray : [(Nat, T)],
    map : Map.Map<Nat, T>,
  ) : Map.Map<Nat, T> {
    Map.fromIter(stableArray.values());
  };

  private func ensureRootAdmin() {
    switch (adminUsersMap.get(rootAdminId)) {
      case (null) {
        let rootAdmin : AdminUser = {
          id = rootAdminId;
          email = rootAdminEmail;
          phone = rootAdminPhone;
          password = rootAdminPassword;
          name = rootAdminName;
          status = "active";
        };
        adminUsersMap.add(rootAdminId, rootAdmin);
      };
      case (?_) { };
    };
  };

  public shared ({ caller }) func login(email : Text, password : Text) : async LoginResult {
    let normalizedEmail = email.toLower();

    let user = adminUsersMap.values().find(
      func(u) { u.email.toLower() == normalizedEmail }
    );

    switch (user) {
      case (null) { #invalidCredentials };
      case (?user) {
        if (user.password == password) {
          if (user.status == "active") {
            #ok;
          } else {
            #accountInactive;
          };
        } else {
          #invalidCredentials;
        };
      };
    };
  };

  public shared ({ caller }) func addAdminUser(email : Text, phone : Text, password : Text) : async Nat {
    let normalizedEmail = email.toLower();

    let existingUser = adminUsersMap.values().find(
      func(u) { u.email.toLower() == normalizedEmail }
    );

    if (existingUser != null) {
      Runtime.trap("Admin already exists");
    };

    let newUser : AdminUser = {
      id = nextAdminUserId;
      email = normalizedEmail;
      phone;
      password;
      name = "";
      status = "active";
    };

    adminUsersMap.add(nextAdminUserId, newUser);
    nextAdminUserId += 1;
    syncStableWithMaps();
    newUser.id;
  };

  public query ({ caller }) func getAdminUsers() : async [AdminUser] {
    adminUsersMap.values().toArray();
  };

  public shared ({ caller }) func deleteAdminUser(id : Nat) : async () {
    switch (adminUsersMap.get(id)) {
      case (null) {
        Runtime.trap("Admin not found");
      };
      case (?adminUser) {
        if (adminUser.email == rootAdminEmail) {
          Runtime.trap("Cannot delete root admin");
        };
        adminUsersMap.remove(id);
        syncStableWithMaps();
      };
    };
  };

  public query ({ caller }) func getEmployees() : async [Employee] {
    employeesMap.values().toArray();
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
    let newEmployee = {
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
    employeesMap.add(id, newEmployee);
    nextEmployeeId += 1;
    syncStableWithMaps();
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
    let _employee = switch (employeesMap.get(employeeId)) {
      case (null) { Runtime.trap("Employee does not exist") };
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

    employeesMap.add(employeeId, updatedEmployee);
    syncStableWithMaps();
  };

  public shared ({ caller }) func deleteEmployee(employeeId : Nat) : async () {
    switch (employeesMap.get(employeeId)) {
      case (null) {
        Runtime.trap("Employee does not exist");
      };
      case (?_existing) {
        employeesMap.remove(employeeId);
        syncStableWithMaps();

        let docsToRemove = documentsMap.entries().filter(func((id, doc)) { doc.employeeId == employeeId }).toArray();
        for ((id, _doc) in docsToRemove.values()) {
          documentsMap.remove(id);
        };
        syncStableWithMaps();
      };
    };
  };

  public shared ({ caller }) func updateEmployeeStatus(employeeId : Nat, status : Text) : async () {
    let employee = switch (employeesMap.get(employeeId)) {
      case (null) {
        Runtime.trap("Employee does not exist");
      };
      case (?existingEmployee) { existingEmployee };
    };
    let updatedEmployee = { employee with employmentStatus = status };
    employeesMap.add(employeeId, updatedEmployee);
    syncStableWithMaps();
  };

  public query ({ caller }) func getDocuments() : async [Document] {
    documentsMap.values().toArray();
  };

  public query ({ caller }) func getDocumentsByEmployee(employeeId : Nat) : async [Document] {
    documentsMap.values().toArray().filter(
      func(d) { d.employeeId == employeeId }
    );
  };

  public shared ({ caller }) func addDocument(
    employeeId : Nat,
    title : Text,
    category : Text,
    status : Text,
    uploadDate : Text,
    expiryDate : Text,
    fileType : Text,
    fileUrl : Text,
  ) : async Nat {
    if (not employeesMap.containsKey(employeeId)) {
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
      fileUrl;
    };

    documentsMap.add(id, doc);
    nextDocumentId += 1;
    syncStableWithMaps();
    id;
  };

  public shared ({ caller }) func updateDocumentStatus(documentId : Nat, status : Text) : async () {
    let doc = switch (documentsMap.get(documentId)) {
      case (null) {
        Runtime.trap("Document does not exist");
      };
      case (?existingDoc) { existingDoc };
    };

    let updatedDoc = { doc with status };
    documentsMap.add(documentId, updatedDoc);
    syncStableWithMaps();
  };

  public shared ({ caller }) func deleteDocument(documentId : Nat) : async () {
    switch (documentsMap.get(documentId)) {
      case (null) {
        Runtime.trap("Document does not exist");
      };
      case (?_existing) {
        documentsMap.remove(documentId);
        syncStableWithMaps();
      };
    };
  };

  system func preupgrade() {
    employees := employeesMap.toArray();
    documents := documentsMap.toArray();
    adminUsers := adminUsersMap.toArray();
  };

  system func postupgrade() {
    employeesMap := initializeMapFromStable(employees, employeesMap);
    documentsMap := initializeMapFromStable(documents, documentsMap);
    adminUsersMap := initializeMapFromStable(adminUsers, adminUsersMap);
    employees := [];
    documents := [];
    adminUsers := [];
    ensureRootAdmin();
  };
};
