// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title IndustrialEquipmentRegistry
 * @dev Manages tamper-evident machine registration, maintenance records, and inspection logs on-chain.
 * Uses role-based access control to enforce permissions for Administrators, Maintenance Engineers,
 * Inspectors, and Factory Operators.
 */
contract IndustrialEquipmentRegistry is AccessControl {
    bytes32 public constant MAINTENANCE_ENGINEER_ROLE = keccak256("MAINTENANCE_ENGINEER_ROLE");
    bytes32 public constant INSPECTOR_ROLE = keccak256("INSPECTOR_ROLE");
    bytes32 public constant FACTORY_OPERATOR_ROLE = keccak256("FACTORY_OPERATOR_ROLE");

    enum MachineStatus {
        Operational,
        UnderMaintenance,
        AwaitingInspection,
        Decommissioned
    }

    struct Machine {
        string machineId;
        string name;
        string category;
        string manufacturer;
        string modelNumber;
        string serialNumber;
        string factoryLocation;
        uint256 installationDate;
        uint256 registrationTimestamp;
        address registeredBy;
        bool exists;
        MachineStatus status;
    }

    struct MaintenanceRecord {
        uint256 recordId;
        string machineId;
        string maintenanceType;
        string problemDescription;
        string workPerformed;
        string partsReplaced;
        address engineer;
        uint256 timestamp;
        string documentHash;
        string metadataURI;
    }

    struct InspectionRecord {
        uint256 recordId;
        string machineId;
        string inspectionType;
        bool passed;
        string inspectionNotes;
        address inspector;
        uint256 timestamp;
        string evidenceHash;
        string metadataURI;
    }

    // Storage
    mapping(string => Machine) private machines;
    string[] private allMachineIds;

    mapping(string => MaintenanceRecord[]) private machineMaintenanceHistory;
    mapping(string => InspectionRecord[]) private machineInspectionHistory;

    // Fast global lookup for document hashes: docHash => true
    mapping(string => bool) private registeredDocumentHashes;

    // Events
    event MachineRegistered(
        string indexed machineId,
        string name,
        string serialNumber,
        string factoryLocation,
        address indexed registeredBy,
        uint256 timestamp
    );

    event MachineStatusUpdated(
        string indexed machineId,
        MachineStatus newStatus,
        address indexed updatedBy,
        uint256 timestamp
    );

    event MaintenanceRecorded(
        string indexed machineId,
        uint256 indexed recordId,
        string maintenanceType,
        address indexed engineer,
        string documentHash,
        uint256 timestamp
    );

    event InspectionRecorded(
        string indexed machineId,
        uint256 indexed recordId,
        string inspectionType,
        bool passed,
        address indexed inspector,
        string evidenceHash,
        uint256 timestamp
    );

    event EngineerAuthorized(address indexed account, address indexed authorizedBy);
    event EngineerRevoked(address indexed account, address indexed revokedBy);

    event InspectorAuthorized(address indexed account, address indexed authorizedBy);
    event InspectorRevoked(address indexed account, address indexed revokedBy);

    event OperatorAuthorized(address indexed account, address indexed authorizedBy);
    event OperatorRevoked(address indexed account, address indexed revokedBy);

    modifier machineMustExist(string calldata machineId) {
        require(machines[machineId].exists, "Machine does not exist");
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // ==========================================
    // Role Management (Administrator Only)
    // ==========================================

    function authorizeEngineer(address engineer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(engineer != address(0), "Invalid engineer address");
        grantRole(MAINTENANCE_ENGINEER_ROLE, engineer);
        emit EngineerAuthorized(engineer, msg.sender);
    }

    function revokeEngineerAuthorization(address engineer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(MAINTENANCE_ENGINEER_ROLE, engineer);
        emit EngineerRevoked(engineer, msg.sender);
    }

    function authorizeInspector(address inspector) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(inspector != address(0), "Invalid inspector address");
        grantRole(INSPECTOR_ROLE, inspector);
        emit InspectorAuthorized(inspector, msg.sender);
    }

    function revokeInspectorAuthorization(address inspector) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(INSPECTOR_ROLE, inspector);
        emit InspectorRevoked(inspector, msg.sender);
    }

    function authorizeOperator(address operator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(operator != address(0), "Invalid operator address");
        grantRole(FACTORY_OPERATOR_ROLE, operator);
        emit OperatorAuthorized(operator, msg.sender);
    }

    function revokeOperatorAuthorization(address operator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(FACTORY_OPERATOR_ROLE, operator);
        emit OperatorRevoked(operator, msg.sender);
    }

    // ==========================================
    // Machine Registration (Administrator Only)
    // ==========================================

    function registerMachine(
        string calldata machineId,
        string calldata name,
        string calldata category,
        string calldata manufacturer,
        string calldata modelNumber,
        string calldata serialNumber,
        string calldata factoryLocation,
        uint256 installationDate
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(bytes(machineId).length > 0, "Machine ID cannot be empty");
        require(!machines[machineId].exists, "Machine already registered with this ID");
        require(bytes(name).length > 0, "Machine name cannot be empty");
        require(bytes(serialNumber).length > 0, "Serial number cannot be empty");

        machines[machineId] = Machine({
            machineId: machineId,
            name: name,
            category: category,
            manufacturer: manufacturer,
            modelNumber: modelNumber,
            serialNumber: serialNumber,
            factoryLocation: factoryLocation,
            installationDate: installationDate,
            registrationTimestamp: block.timestamp,
            registeredBy: msg.sender,
            exists: true,
            status: MachineStatus.Operational
        });

        allMachineIds.push(machineId);

        emit MachineRegistered(
            machineId,
            name,
            serialNumber,
            factoryLocation,
            msg.sender,
            block.timestamp
        );
    }

    // ==========================================
    // Operational Status Management
    // ==========================================

    function updateMachineStatus(
        string calldata machineId,
        MachineStatus newStatus
    ) external machineMustExist(machineId) {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender) ||
            hasRole(MAINTENANCE_ENGINEER_ROLE, msg.sender) ||
            hasRole(FACTORY_OPERATOR_ROLE, msg.sender),
            "Unauthorized to update machine status"
        );

        machines[machineId].status = newStatus;

        emit MachineStatusUpdated(machineId, newStatus, msg.sender, block.timestamp);
    }

    // ==========================================
    // Maintenance Record Creation (Engineer Only)
    // ==========================================

    function addMaintenanceRecord(
        string calldata machineId,
        string calldata maintenanceType,
        string calldata problemDescription,
        string calldata workPerformed,
        string calldata partsReplaced,
        string calldata documentHash,
        string calldata metadataURI
    ) external onlyRole(MAINTENANCE_ENGINEER_ROLE) machineMustExist(machineId) returns (uint256) {
        require(bytes(maintenanceType).length > 0, "Maintenance type required");
        require(bytes(problemDescription).length > 0, "Problem description required");
        require(bytes(workPerformed).length > 0, "Work performed required");

        uint256 newRecordId = machineMaintenanceHistory[machineId].length;

        MaintenanceRecord memory record = MaintenanceRecord({
            recordId: newRecordId,
            machineId: machineId,
            maintenanceType: maintenanceType,
            problemDescription: problemDescription,
            workPerformed: workPerformed,
            partsReplaced: partsReplaced,
            engineer: msg.sender,
            timestamp: block.timestamp,
            documentHash: documentHash,
            metadataURI: metadataURI
        });

        machineMaintenanceHistory[machineId].push(record);

        if (bytes(documentHash).length > 0) {
            registeredDocumentHashes[documentHash] = true;
        }

        // Automatic machine status update upon maintenance completion
        machines[machineId].status = MachineStatus.AwaitingInspection;

        emit MaintenanceRecorded(
            machineId,
            newRecordId,
            maintenanceType,
            msg.sender,
            documentHash,
            block.timestamp
        );

        return newRecordId;
    }

    // ==========================================
    // Inspection Record Creation (Inspector Only)
    // ==========================================

    function addInspectionRecord(
        string calldata machineId,
        string calldata inspectionType,
        bool passed,
        string calldata inspectionNotes,
        string calldata evidenceHash,
        string calldata metadataURI
    ) external onlyRole(INSPECTOR_ROLE) machineMustExist(machineId) returns (uint256) {
        require(bytes(inspectionType).length > 0, "Inspection type required");

        uint256 newRecordId = machineInspectionHistory[machineId].length;

        InspectionRecord memory record = InspectionRecord({
            recordId: newRecordId,
            machineId: machineId,
            inspectionType: inspectionType,
            passed: passed,
            inspectionNotes: inspectionNotes,
            inspector: msg.sender,
            timestamp: block.timestamp,
            evidenceHash: evidenceHash,
            metadataURI: metadataURI
        });

        machineInspectionHistory[machineId].push(record);

        if (bytes(evidenceHash).length > 0) {
            registeredDocumentHashes[evidenceHash] = true;
        }

        // Update machine status based on inspection outcome
        if (passed) {
            machines[machineId].status = MachineStatus.Operational;
        } else {
            machines[machineId].status = MachineStatus.UnderMaintenance;
        }

        emit InspectionRecorded(
            machineId,
            newRecordId,
            inspectionType,
            passed,
            msg.sender,
            evidenceHash,
            block.timestamp
        );

        return newRecordId;
    }

    // ==========================================
    // Query / Retrieval Functions
    // ==========================================

    function getMachineDetails(
        string calldata machineId
    ) external view machineMustExist(machineId) returns (Machine memory) {
        return machines[machineId];
    }

    function getMaintenanceHistory(
        string calldata machineId
    ) external view machineMustExist(machineId) returns (MaintenanceRecord[] memory) {
        return machineMaintenanceHistory[machineId];
    }

    function getInspectionHistory(
        string calldata machineId
    ) external view machineMustExist(machineId) returns (InspectionRecord[] memory) {
        return machineInspectionHistory[machineId];
    }

    function getAllMachineIds() external view returns (string[] memory) {
        return allMachineIds;
    }

    function getMachineCount() external view returns (uint256) {
        return allMachineIds.length;
    }

    function getMaintenanceRecordCount(string calldata machineId) external view returns (uint256) {
        return machineMaintenanceHistory[machineId].length;
    }

    function getInspectionRecordCount(string calldata machineId) external view returns (uint256) {
        return machineInspectionHistory[machineId].length;
    }

    // ==========================================
    // Tamper-Evident Verification Functions
    // ==========================================

    function isDocumentHashRegistered(string calldata docHash) external view returns (bool) {
        if (bytes(docHash).length == 0) return false;
        return registeredDocumentHashes[docHash];
    }

    function verifyDocumentHash(
        string calldata machineId,
        string calldata docHash
    ) external view returns (
        bool exists,
        string memory recordType,
        uint256 timestamp,
        address submitter
    ) {
        if (bytes(docHash).length == 0 || !machines[machineId].exists) {
            return (false, "", 0, address(0));
        }

        // Check maintenance records for this machine
        MaintenanceRecord[] storage mRecords = machineMaintenanceHistory[machineId];
        for (uint256 i = 0; i < mRecords.length; i++) {
            if (keccak256(bytes(mRecords[i].documentHash)) == keccak256(bytes(docHash))) {
                return (true, "MAINTENANCE", mRecords[i].timestamp, mRecords[i].engineer);
            }
        }

        // Check inspection records for this machine
        InspectionRecord[] storage iRecords = machineInspectionHistory[machineId];
        for (uint256 j = 0; j < iRecords.length; j++) {
            if (keccak256(bytes(iRecords[j].evidenceHash)) == keccak256(bytes(docHash))) {
                return (true, "INSPECTION", iRecords[j].timestamp, iRecords[j].inspector);
            }
        }

        return (false, "", 0, address(0));
    }

    function verifyRecordExists(
        string calldata machineId,
        string calldata recordType,
        uint256 recordId
    ) external view returns (bool) {
        if (!machines[machineId].exists) return false;

        if (keccak256(bytes(recordType)) == keccak256(bytes("MAINTENANCE"))) {
            return recordId < machineMaintenanceHistory[machineId].length;
        } else if (keccak256(bytes(recordType)) == keccak256(bytes("INSPECTION"))) {
            return recordId < machineInspectionHistory[machineId].length;
        }
        return false;
    }
}
