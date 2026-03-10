#!/usr/bin/env python3
"""
Generates a complete .xcodeproj for SuperAppTributaria iOS app.
Writes project.pbxproj with all source files, resources, SPM deps, and targets.
"""

import os
import uuid
import hashlib

# ─── Helpers ───

def pbx_id(name: str) -> str:
    """Generate a deterministic 24-char hex ID from a name."""
    return hashlib.md5(name.encode()).hexdigest()[:24].upper()

def collect_swift_files(root: str) -> list[tuple[str, str]]:
    """Return list of (relative_path, filename) for all .swift files."""
    files = []
    for dirpath, _, filenames in os.walk(root):
        for f in sorted(filenames):
            if f.endswith('.swift'):
                rel = os.path.relpath(os.path.join(dirpath, f), root)
                files.append((rel, f))
    return files

# ─── Configuration ───

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.join(PROJECT_ROOT, "SuperAppTributaria")
TEST_DIR = os.path.join(PROJECT_ROOT, "SuperAppTributariaTests")
UITEST_DIR = os.path.join(PROJECT_ROOT, "SuperAppTributariaUITests")

ORG_ID = "co.tribai"
APP_TARGET = "SuperAppTributaria"
TEST_TARGET = "SuperAppTributariaTests"
UITEST_TARGET = "SuperAppTributariaUITests"

# Collect files
app_files = collect_swift_files(APP_DIR)
test_files = collect_swift_files(TEST_DIR)
uitest_files = collect_swift_files(UITEST_DIR)

# Resource files
resource_files = [
    ("Resources/PrivacyInfo.xcprivacy", "PrivacyInfo.xcprivacy"),
    ("Localization/Localizable.xcstrings", "Localizable.xcstrings"),
]

# ─── ID Generation ───

# Project-level IDs
PROJECT_ID = pbx_id("project_root")
MAIN_GROUP_ID = pbx_id("main_group")
APP_GROUP_ID = pbx_id("app_group")
TEST_GROUP_ID = pbx_id("test_group")
UITEST_GROUP_ID = pbx_id("uitest_group")
FRAMEWORKS_GROUP_ID = pbx_id("frameworks_group")
PRODUCTS_GROUP_ID = pbx_id("products_group")

# Target IDs
APP_TARGET_ID = pbx_id("target_app")
TEST_TARGET_ID = pbx_id("target_test")
UITEST_TARGET_ID = pbx_id("target_uitest")

# Product IDs
APP_PRODUCT_ID = pbx_id("product_app")
TEST_PRODUCT_ID = pbx_id("product_test")
UITEST_PRODUCT_ID = pbx_id("product_uitest")

# Build phase IDs
APP_SOURCES_PHASE_ID = pbx_id("phase_app_sources")
APP_RESOURCES_PHASE_ID = pbx_id("phase_app_resources")
APP_FRAMEWORKS_PHASE_ID = pbx_id("phase_app_frameworks")
TEST_SOURCES_PHASE_ID = pbx_id("phase_test_sources")
TEST_FRAMEWORKS_PHASE_ID = pbx_id("phase_test_frameworks")
UITEST_SOURCES_PHASE_ID = pbx_id("phase_uitest_sources")
UITEST_FRAMEWORKS_PHASE_ID = pbx_id("phase_uitest_frameworks")

# Build config IDs
PROJECT_DEBUG_ID = pbx_id("config_project_debug")
PROJECT_RELEASE_ID = pbx_id("config_project_release")
PROJECT_CONFIGLIST_ID = pbx_id("configlist_project")
APP_DEBUG_ID = pbx_id("config_app_debug")
APP_RELEASE_ID = pbx_id("config_app_release")
APP_CONFIGLIST_ID = pbx_id("configlist_app")
TEST_DEBUG_ID = pbx_id("config_test_debug")
TEST_RELEASE_ID = pbx_id("config_test_release")
TEST_CONFIGLIST_ID = pbx_id("configlist_test")
UITEST_DEBUG_ID = pbx_id("config_uitest_debug")
UITEST_RELEASE_ID = pbx_id("config_uitest_release")
UITEST_CONFIGLIST_ID = pbx_id("configlist_uitest")

# Target dependency IDs
TEST_DEP_ID = pbx_id("dep_test")
TEST_DEP_PROXY_ID = pbx_id("dep_proxy_test")
UITEST_DEP_ID = pbx_id("dep_uitest")
UITEST_DEP_PROXY_ID = pbx_id("dep_proxy_uitest")

# SPM package IDs
PKG_MARKDOWN_ID = pbx_id("pkg_markdownui")
PKG_KEYCHAIN_ID = pbx_id("pkg_keychainaccess")
PKG_MARKDOWN_PRODUCT_ID = pbx_id("pkg_prod_markdownui")
PKG_KEYCHAIN_PRODUCT_ID = pbx_id("pkg_prod_keychainaccess")

# Generate file reference and build file IDs
def file_ids(path: str, prefix: str):
    ref_id = pbx_id(f"ref_{prefix}_{path}")
    build_id = pbx_id(f"build_{prefix}_{path}")
    return ref_id, build_id

# ─── Build the pbxproj ───

lines = []
def w(s=""): lines.append(s)

w("// !$*UTF8*$!")
w("{")
w("\tarchiveVersion = 1;")
w("\tclasses = {")
w("\t};")
w("\tobjectVersion = 77;")
w("\tobjects = {")
w("")

# ─── PBXBuildFile ───
w("/* Begin PBXBuildFile section */")

# App source build files
for rel, fname in app_files:
    _, build_id = file_ids(rel, "app")
    w(f"\t\t{build_id} /* {fname} in Sources */ = {{isa = PBXBuildFile; fileRef = {file_ids(rel, 'app')[0]}; }};")

# App resource build files
for rel, fname in resource_files:
    _, build_id = file_ids(rel, "res")
    w(f"\t\t{build_id} /* {fname} in Resources */ = {{isa = PBXBuildFile; fileRef = {file_ids(rel, 'res')[0]}; }};")

# Test source build files
for rel, fname in test_files:
    _, build_id = file_ids(rel, "test")
    w(f"\t\t{build_id} /* {fname} in Sources */ = {{isa = PBXBuildFile; fileRef = {file_ids(rel, 'test')[0]}; }};")

# UI test source build files
for rel, fname in uitest_files:
    _, build_id = file_ids(rel, "uitest")
    w(f"\t\t{build_id} /* {fname} in Sources */ = {{isa = PBXBuildFile; fileRef = {file_ids(rel, 'uitest')[0]}; }};")

w("/* End PBXBuildFile section */")
w("")

# ─── PBXContainerItemProxy ───
w("/* Begin PBXContainerItemProxy section */")
w(f"\t\t{TEST_DEP_PROXY_ID} = {{")
w("\t\t\tisa = PBXContainerItemProxy;")
w(f"\t\t\tcontainerPortal = {PROJECT_ID};")
w("\t\t\tproxyType = 1;")
w(f"\t\t\tremoteGlobalIDString = {APP_TARGET_ID};")
w(f'\t\t\tremoteInfo = "{APP_TARGET}";')
w("\t\t};")
w(f"\t\t{UITEST_DEP_PROXY_ID} = {{")
w("\t\t\tisa = PBXContainerItemProxy;")
w(f"\t\t\tcontainerPortal = {PROJECT_ID};")
w("\t\t\tproxyType = 1;")
w(f"\t\t\tremoteGlobalIDString = {APP_TARGET_ID};")
w(f'\t\t\tremoteInfo = "{APP_TARGET}";')
w("\t\t};")
w("/* End PBXContainerItemProxy section */")
w("")

# ─── PBXFileReference ───
w("/* Begin PBXFileReference section */")

# App product
w(f'\t\t{APP_PRODUCT_ID} /* {APP_TARGET}.app */ = {{isa = PBXFileReference; explicitFileType = wrapper.application; includeInIndex = 0; path = "{APP_TARGET}.app"; sourceTree = BUILT_PRODUCTS_DIR; }};')
w(f'\t\t{TEST_PRODUCT_ID} /* {TEST_TARGET}.xctest */ = {{isa = PBXFileReference; explicitFileType = wrapper.cfbundle; includeInIndex = 0; path = "{TEST_TARGET}.xctest"; sourceTree = BUILT_PRODUCTS_DIR; }};')
w(f'\t\t{UITEST_PRODUCT_ID} /* {UITEST_TARGET}.xctest */ = {{isa = PBXFileReference; explicitFileType = wrapper.cfbundle; includeInIndex = 0; path = "{UITEST_TARGET}.xctest"; sourceTree = BUILT_PRODUCTS_DIR; }};')

# App source files
for rel, fname in app_files:
    ref_id, _ = file_ids(rel, "app")
    w(f'\t\t{ref_id} /* {fname} */ = {{isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = "{fname}"; sourceTree = "<group>"; }};')

# Resource files
for rel, fname in resource_files:
    ref_id, _ = file_ids(rel, "res")
    ftype = "text.plist.xml" if fname.endswith(".xcprivacy") else "text.json.xcstrings"
    w(f'\t\t{ref_id} /* {fname} */ = {{isa = PBXFileReference; lastKnownFileType = {ftype}; path = "{fname}"; sourceTree = "<group>"; }};')

# Entitlements
ENTITLEMENTS_ID = pbx_id("ref_entitlements")
w(f'\t\t{ENTITLEMENTS_ID} /* SuperAppTributaria.entitlements */ = {{isa = PBXFileReference; lastKnownFileType = text.plist.entitlements; path = "SuperAppTributaria.entitlements"; sourceTree = "<group>"; }};')

# Test files
for rel, fname in test_files:
    ref_id, _ = file_ids(rel, "test")
    w(f'\t\t{ref_id} /* {fname} */ = {{isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = "{fname}"; sourceTree = "<group>"; }};')

# UI test files
for rel, fname in uitest_files:
    ref_id, _ = file_ids(rel, "uitest")
    w(f'\t\t{ref_id} /* {fname} */ = {{isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = "{fname}"; sourceTree = "<group>"; }};')

w("/* End PBXFileReference section */")
w("")

# ─── PBXGroup ───
w("/* Begin PBXGroup section */")

# Main group
w(f"\t\t{MAIN_GROUP_ID} = {{")
w("\t\t\tisa = PBXGroup;")
w("\t\t\tchildren = (")
w(f"\t\t\t\t{APP_GROUP_ID},")
w(f"\t\t\t\t{TEST_GROUP_ID},")
w(f"\t\t\t\t{UITEST_GROUP_ID},")
w(f"\t\t\t\t{PRODUCTS_GROUP_ID},")
w("\t\t\t);")
w("\t\t\tsourceTree = \"<group>\";")
w("\t\t};")

# Products group
w(f"\t\t{PRODUCTS_GROUP_ID} /* Products */ = {{")
w("\t\t\tisa = PBXGroup;")
w("\t\t\tchildren = (")
w(f"\t\t\t\t{APP_PRODUCT_ID},")
w(f"\t\t\t\t{TEST_PRODUCT_ID},")
w(f"\t\t\t\t{UITEST_PRODUCT_ID},")
w("\t\t\t);")
w('\t\t\tname = Products;')
w("\t\t\tsourceTree = \"<group>\";")
w("\t\t};")

# Build group hierarchy from app files
def build_groups(files, prefix, group_name, group_id, root_path):
    """Build PBXGroup entries for nested directory structure."""
    # Organize files by directory
    dirs = {}  # dir_path -> [(filename, ref_id)]
    for rel, fname in files:
        dir_path = os.path.dirname(rel)
        ref_id, _ = file_ids(rel, prefix)
        if dir_path not in dirs:
            dirs[dir_path] = []
        dirs[dir_path].append((fname, ref_id))

    # Build directory tree
    all_dirs = set()
    for d in dirs:
        parts = d.split(os.sep) if d else []
        for i in range(len(parts)):
            all_dirs.add(os.sep.join(parts[:i+1]))
    all_dirs.add("")  # root

    # Generate group for each directory
    group_entries = []
    for dir_path in sorted(all_dirs):
        gid = group_id if dir_path == "" else pbx_id(f"group_{prefix}_{dir_path}")
        gname = group_name if dir_path == "" else os.path.basename(dir_path)

        # Children: subdirectories + files
        children = []

        # Subdirectories
        for d in sorted(all_dirs):
            if d == dir_path:
                continue
            parent = os.path.dirname(d)
            if parent == dir_path and d != "":
                child_gid = pbx_id(f"group_{prefix}_{d}")
                children.append((os.path.basename(d), child_gid))

        # Files in this directory
        if dir_path in dirs:
            for fname, ref_id in sorted(dirs[dir_path]):
                children.append((fname, ref_id))

        w(f"\t\t{gid} /* {gname} */ = {{")
        w("\t\t\tisa = PBXGroup;")
        w("\t\t\tchildren = (")
        for cname, cid in children:
            w(f"\t\t\t\t{cid} /* {cname} */,")
        w("\t\t\t);")
        if dir_path == "":
            w(f'\t\t\tpath = "{root_path}";')
        else:
            w(f'\t\t\tpath = "{os.path.basename(dir_path)}";')
        w("\t\t\tsourceTree = \"<group>\";")
        w("\t\t};")

    return group_entries

# App group — add entitlements and resource refs
# First, create a combined list including special files
all_app_items = list(app_files)
build_groups(app_files, "app", APP_TARGET, APP_GROUP_ID, APP_TARGET)

# Manually add Resources and Localization groups under app group
# (these contain non-swift files that build_groups doesn't handle)
RESOURCES_GROUP_ID = pbx_id("group_app_Resources")
LOCALIZATION_GROUP_ID = pbx_id("group_app_Localization")

# Test group
build_groups(test_files, "test", TEST_TARGET, TEST_GROUP_ID, TEST_TARGET)

# UI test group
build_groups(uitest_files, "uitest", UITEST_TARGET, UITEST_GROUP_ID, UITEST_TARGET)

w("/* End PBXGroup section */")
w("")

# ─── PBXNativeTarget ───
w("/* Begin PBXNativeTarget section */")

# App target
w(f"\t\t{APP_TARGET_ID} /* {APP_TARGET} */ = {{")
w("\t\t\tisa = PBXNativeTarget;")
w(f"\t\t\tbuildConfigurationList = {APP_CONFIGLIST_ID};")
w("\t\t\tbuildPhases = (")
w(f"\t\t\t\t{APP_SOURCES_PHASE_ID},")
w(f"\t\t\t\t{APP_RESOURCES_PHASE_ID},")
w(f"\t\t\t\t{APP_FRAMEWORKS_PHASE_ID},")
w("\t\t\t);")
w("\t\t\tbuildRules = (")
w("\t\t\t);")
w("\t\t\tdependencies = (")
w("\t\t\t);")
w(f'\t\t\tname = "{APP_TARGET}";')
w("\t\t\tpackageProductDependencies = (")
w(f"\t\t\t\t{PKG_MARKDOWN_PRODUCT_ID},")
w(f"\t\t\t\t{PKG_KEYCHAIN_PRODUCT_ID},")
w("\t\t\t);")
w(f"\t\t\tproductName = \"{APP_TARGET}\";")
w(f"\t\t\tproductReference = {APP_PRODUCT_ID};")
w("\t\t\tproductType = \"com.apple.product-type.application\";")
w("\t\t};")

# Test target
w(f"\t\t{TEST_TARGET_ID} /* {TEST_TARGET} */ = {{")
w("\t\t\tisa = PBXNativeTarget;")
w(f"\t\t\tbuildConfigurationList = {TEST_CONFIGLIST_ID};")
w("\t\t\tbuildPhases = (")
w(f"\t\t\t\t{TEST_SOURCES_PHASE_ID},")
w(f"\t\t\t\t{TEST_FRAMEWORKS_PHASE_ID},")
w("\t\t\t);")
w("\t\t\tbuildRules = (")
w("\t\t\t);")
w("\t\t\tdependencies = (")
w(f"\t\t\t\t{TEST_DEP_ID},")
w("\t\t\t);")
w(f'\t\t\tname = "{TEST_TARGET}";')
w(f"\t\t\tproductName = \"{TEST_TARGET}\";")
w(f"\t\t\tproductReference = {TEST_PRODUCT_ID};")
w("\t\t\tproductType = \"com.apple.product-type.bundle.unit-test\";")
w("\t\t};")

# UI test target
w(f"\t\t{UITEST_TARGET_ID} /* {UITEST_TARGET} */ = {{")
w("\t\t\tisa = PBXNativeTarget;")
w(f"\t\t\tbuildConfigurationList = {UITEST_CONFIGLIST_ID};")
w("\t\t\tbuildPhases = (")
w(f"\t\t\t\t{UITEST_SOURCES_PHASE_ID},")
w(f"\t\t\t\t{UITEST_FRAMEWORKS_PHASE_ID},")
w("\t\t\t);")
w("\t\t\tbuildRules = (")
w("\t\t\t);")
w("\t\t\tdependencies = (")
w(f"\t\t\t\t{UITEST_DEP_ID},")
w("\t\t\t);")
w(f'\t\t\tname = "{UITEST_TARGET}";')
w(f"\t\t\tproductName = \"{UITEST_TARGET}\";")
w(f"\t\t\tproductReference = {UITEST_PRODUCT_ID};")
w("\t\t\tproductType = \"com.apple.product-type.bundle.ui-testing\";")
w("\t\t};")

w("/* End PBXNativeTarget section */")
w("")

# ─── PBXProject ───
w("/* Begin PBXProject section */")
w(f"\t\t{PROJECT_ID} /* Project object */ = {{")
w("\t\t\tisa = PBXProject;")
w(f"\t\t\tbuildConfigurationList = {PROJECT_CONFIGLIST_ID};")
w("\t\t\tcompatibilityVersion = \"Xcode 15.0\";")
w("\t\t\tdevelopmentRegion = es;")
w("\t\t\thasScannedForEncodings = 0;")
w("\t\t\tknownRegions = (")
w("\t\t\t\tes,")
w("\t\t\t\tBase,")
w("\t\t\t);")
w(f"\t\t\tmainGroup = {MAIN_GROUP_ID};")
w("\t\t\tpackageReferences = (")
w(f"\t\t\t\t{PKG_MARKDOWN_ID},")
w(f"\t\t\t\t{PKG_KEYCHAIN_ID},")
w("\t\t\t);")
w(f"\t\t\tproductRefGroup = {PRODUCTS_GROUP_ID};")
w("\t\t\tprojectDirPath = \"\";")
w("\t\t\tprojectRoot = \"\";")
w("\t\t\ttargets = (")
w(f"\t\t\t\t{APP_TARGET_ID},")
w(f"\t\t\t\t{TEST_TARGET_ID},")
w(f"\t\t\t\t{UITEST_TARGET_ID},")
w("\t\t\t);")
w("\t\t};")
w("/* End PBXProject section */")
w("")

# ─── PBXResourcesBuildPhase ───
w("/* Begin PBXResourcesBuildPhase section */")
w(f"\t\t{APP_RESOURCES_PHASE_ID} /* Resources */ = {{")
w("\t\t\tisa = PBXResourcesBuildPhase;")
w("\t\t\tbuildActionMask = 2147483647;")
w("\t\t\tfiles = (")
for rel, fname in resource_files:
    _, build_id = file_ids(rel, "res")
    w(f"\t\t\t\t{build_id} /* {fname} */,")
w("\t\t\t);")
w("\t\t\trunOnlyForDeploymentPostprocessing = 0;")
w("\t\t};")
w("/* End PBXResourcesBuildPhase section */")
w("")

# ─── PBXSourcesBuildPhase ───
w("/* Begin PBXSourcesBuildPhase section */")

# App sources
w(f"\t\t{APP_SOURCES_PHASE_ID} /* Sources */ = {{")
w("\t\t\tisa = PBXSourcesBuildPhase;")
w("\t\t\tbuildActionMask = 2147483647;")
w("\t\t\tfiles = (")
for rel, fname in app_files:
    _, build_id = file_ids(rel, "app")
    w(f"\t\t\t\t{build_id} /* {fname} */,")
w("\t\t\t);")
w("\t\t\trunOnlyForDeploymentPostprocessing = 0;")
w("\t\t};")

# Test sources
w(f"\t\t{TEST_SOURCES_PHASE_ID} /* Sources */ = {{")
w("\t\t\tisa = PBXSourcesBuildPhase;")
w("\t\t\tbuildActionMask = 2147483647;")
w("\t\t\tfiles = (")
for rel, fname in test_files:
    _, build_id = file_ids(rel, "test")
    w(f"\t\t\t\t{build_id} /* {fname} */,")
w("\t\t\t);")
w("\t\t\trunOnlyForDeploymentPostprocessing = 0;")
w("\t\t};")

# UI test sources
w(f"\t\t{UITEST_SOURCES_PHASE_ID} /* Sources */ = {{")
w("\t\t\tisa = PBXSourcesBuildPhase;")
w("\t\t\tbuildActionMask = 2147483647;")
w("\t\t\tfiles = (")
for rel, fname in uitest_files:
    _, build_id = file_ids(rel, "uitest")
    w(f"\t\t\t\t{build_id} /* {fname} */,")
w("\t\t\t);")
w("\t\t\trunOnlyForDeploymentPostprocessing = 0;")
w("\t\t};")

w("/* End PBXSourcesBuildPhase section */")
w("")

# ─── PBXFrameworksBuildPhase ───
w("/* Begin PBXFrameworksBuildPhase section */")
for phase_id, name in [(APP_FRAMEWORKS_PHASE_ID, APP_TARGET), (TEST_FRAMEWORKS_PHASE_ID, TEST_TARGET), (UITEST_FRAMEWORKS_PHASE_ID, UITEST_TARGET)]:
    w(f"\t\t{phase_id} /* Frameworks */ = {{")
    w("\t\t\tisa = PBXFrameworksBuildPhase;")
    w("\t\t\tbuildActionMask = 2147483647;")
    w("\t\t\tfiles = (")
    w("\t\t\t);")
    w("\t\t\trunOnlyForDeploymentPostprocessing = 0;")
    w("\t\t};")
w("/* End PBXFrameworksBuildPhase section */")
w("")

# ─── PBXTargetDependency ───
w("/* Begin PBXTargetDependency section */")
w(f"\t\t{TEST_DEP_ID} = {{")
w("\t\t\tisa = PBXTargetDependency;")
w(f"\t\t\ttarget = {APP_TARGET_ID};")
w(f"\t\t\ttargetProxy = {TEST_DEP_PROXY_ID};")
w("\t\t};")
w(f"\t\t{UITEST_DEP_ID} = {{")
w("\t\t\tisa = PBXTargetDependency;")
w(f"\t\t\ttarget = {APP_TARGET_ID};")
w(f"\t\t\ttargetProxy = {UITEST_DEP_PROXY_ID};")
w("\t\t};")
w("/* End PBXTargetDependency section */")
w("")

# ─── XCBuildConfiguration ───
w("/* Begin XCBuildConfiguration section */")

# Project Debug
w(f"\t\t{PROJECT_DEBUG_ID} /* Debug */ = {{")
w("\t\t\tisa = XCBuildConfiguration;")
w("\t\t\tbuildSettings = {")
w("\t\t\t\tALWAYS_SEARCH_USER_PATHS = NO;")
w("\t\t\t\tCLANG_ANALYZER_NONNULL = YES;")
w("\t\t\t\tCLANG_CXX_LANGUAGE_STANDARD = \"gnu++20\";")
w("\t\t\t\tCLANG_ENABLE_MODULES = YES;")
w("\t\t\t\tCLANG_ENABLE_OBJC_ARC = YES;")
w("\t\t\t\tCOPY_PHASE_STRIP = NO;")
w("\t\t\t\tDEBUG_INFORMATION_FORMAT = dwarf;")
w("\t\t\t\tENABLE_STRICT_OBJC_MSGSEND = YES;")
w("\t\t\t\tENABLE_TESTABILITY = YES;")
w("\t\t\t\tGCC_DYNAMIC_NO_PIC = NO;")
w("\t\t\t\tGCC_OPTIMIZATION_LEVEL = 0;")
w("\t\t\t\tGCC_PREPROCESSOR_DEFINITIONS = (")
w('\t\t\t\t\t"DEBUG=1",')
w('\t\t\t\t\t"$(inherited)",')
w("\t\t\t\t);")
w("\t\t\t\tIPHONEOS_DEPLOYMENT_TARGET = 17.0;")
w("\t\t\t\tMTL_ENABLE_DEBUG_INFO = INCLUDE_SOURCE;")
w("\t\t\t\tONLY_ACTIVE_ARCH = YES;")
w("\t\t\t\tSDKROOT = iphoneos;")
w("\t\t\t\tSWIFT_ACTIVE_COMPILATION_CONDITIONS = \"$(inherited) DEBUG\";")
w("\t\t\t\tSWIFT_OPTIMIZATION_LEVEL = \"-Onone\";")
w("\t\t\t\tSWIFT_VERSION = 6.0;")
w("\t\t\t};")
w("\t\t\tname = Debug;")
w("\t\t};")

# Project Release
w(f"\t\t{PROJECT_RELEASE_ID} /* Release */ = {{")
w("\t\t\tisa = XCBuildConfiguration;")
w("\t\t\tbuildSettings = {")
w("\t\t\t\tALWAYS_SEARCH_USER_PATHS = NO;")
w("\t\t\t\tCLANG_ANALYZER_NONNULL = YES;")
w("\t\t\t\tCLANG_CXX_LANGUAGE_STANDARD = \"gnu++20\";")
w("\t\t\t\tCLANG_ENABLE_MODULES = YES;")
w("\t\t\t\tCLANG_ENABLE_OBJC_ARC = YES;")
w("\t\t\t\tCOPY_PHASE_STRIP = NO;")
w("\t\t\t\tDEBUG_INFORMATION_FORMAT = \"dwarf-with-dsym\";")
w("\t\t\t\tENABLE_NS_ASSERTIONS = NO;")
w("\t\t\t\tENABLE_STRICT_OBJC_MSGSEND = YES;")
w("\t\t\t\tIPHONEOS_DEPLOYMENT_TARGET = 17.0;")
w("\t\t\t\tMTL_ENABLE_DEBUG_INFO = NO;")
w("\t\t\t\tSDKROOT = iphoneos;")
w("\t\t\t\tSWIFT_COMPILATION_MODE = wholemodule;")
w("\t\t\t\tSWIFT_VERSION = 6.0;")
w("\t\t\t\tVALIDATE_PRODUCT = YES;")
w("\t\t\t};")
w("\t\t\tname = Release;")
w("\t\t};")

# App Debug
w(f"\t\t{APP_DEBUG_ID} /* Debug */ = {{")
w("\t\t\tisa = XCBuildConfiguration;")
w("\t\t\tbuildSettings = {")
w("\t\t\t\tASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;")
w(f'\t\t\t\tCODE_SIGN_ENTITLEMENTS = "SuperAppTributaria/SuperAppTributaria.entitlements";')
w("\t\t\t\tCODE_SIGN_STYLE = Automatic;")
w("\t\t\t\tCURRENT_PROJECT_VERSION = 1;")
w("\t\t\t\tGENERATE_INFOPLIST_FILE = YES;")
w(f'\t\t\t\tINFOPLIST_KEY_CFBundleDisplayName = "TribAI";')
w('\t\t\t\tINFOPLIST_KEY_LSApplicationCategoryType = "public.app-category.finance";')
w("\t\t\t\tINFOPLIST_KEY_UIApplicationSceneManifest_Generation = YES;")
w("\t\t\t\tINFOPLIST_KEY_UIApplicationSupportsIndirectInputEvents = YES;")
w("\t\t\t\tINFOPLIST_KEY_UILaunchScreen_Generation = YES;")
w('\t\t\t\tINFOPLIST_KEY_UISupportedInterfaceOrientations = "UIInterfaceOrientationPortrait UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight";')
w('\t\t\t\tINFOPLIST_KEY_UISupportedInterfaceOrientations_iPad = "UIInterfaceOrientationPortrait UIInterfaceOrientationPortraitUpsideDown UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight";')
w("\t\t\t\tLD_RUNPATH_SEARCH_PATHS = (")
w('\t\t\t\t\t"$(inherited)",')
w('\t\t\t\t\t"@executable_path/Frameworks",')
w("\t\t\t\t);")
w("\t\t\t\tMARKETING_VERSION = 1.0.0;")
w(f'\t\t\t\tPRODUCT_BUNDLE_IDENTIFIER = "co.tribai.app";')
w(f'\t\t\t\tPRODUCT_NAME = "$(TARGET_NAME)";')
w('\t\t\t\tSWIFT_EMIT_LOC_STRINGS = YES;')
w('\t\t\t\tTARGETED_DEVICE_FAMILY = "1,2";')
w("\t\t\t};")
w("\t\t\tname = Debug;")
w("\t\t};")

# App Release
w(f"\t\t{APP_RELEASE_ID} /* Release */ = {{")
w("\t\t\tisa = XCBuildConfiguration;")
w("\t\t\tbuildSettings = {")
w("\t\t\t\tASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;")
w(f'\t\t\t\tCODE_SIGN_ENTITLEMENTS = "SuperAppTributaria/SuperAppTributaria.entitlements";')
w("\t\t\t\tCODE_SIGN_STYLE = Automatic;")
w("\t\t\t\tCURRENT_PROJECT_VERSION = 1;")
w("\t\t\t\tGENERATE_INFOPLIST_FILE = YES;")
w(f'\t\t\t\tINFOPLIST_KEY_CFBundleDisplayName = "TribAI";')
w('\t\t\t\tINFOPLIST_KEY_LSApplicationCategoryType = "public.app-category.finance";')
w("\t\t\t\tINFOPLIST_KEY_UIApplicationSceneManifest_Generation = YES;")
w("\t\t\t\tINFOPLIST_KEY_UIApplicationSupportsIndirectInputEvents = YES;")
w("\t\t\t\tINFOPLIST_KEY_UILaunchScreen_Generation = YES;")
w('\t\t\t\tINFOPLIST_KEY_UISupportedInterfaceOrientations = "UIInterfaceOrientationPortrait UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight";')
w('\t\t\t\tINFOPLIST_KEY_UISupportedInterfaceOrientations_iPad = "UIInterfaceOrientationPortrait UIInterfaceOrientationPortraitUpsideDown UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight";')
w("\t\t\t\tLD_RUNPATH_SEARCH_PATHS = (")
w('\t\t\t\t\t"$(inherited)",')
w('\t\t\t\t\t"@executable_path/Frameworks",')
w("\t\t\t\t);")
w("\t\t\t\tMARKETING_VERSION = 1.0.0;")
w(f'\t\t\t\tPRODUCT_BUNDLE_IDENTIFIER = "co.tribai.app";')
w(f'\t\t\t\tPRODUCT_NAME = "$(TARGET_NAME)";')
w('\t\t\t\tSWIFT_EMIT_LOC_STRINGS = YES;')
w('\t\t\t\tTARGETED_DEVICE_FAMILY = "1,2";')
w("\t\t\t};")
w("\t\t\tname = Release;")
w("\t\t};")

# Test Debug
w(f"\t\t{TEST_DEBUG_ID} /* Debug */ = {{")
w("\t\t\tisa = XCBuildConfiguration;")
w("\t\t\tbuildSettings = {")
w(f'\t\t\t\tBUNDLE_LOADER = "$(TEST_HOST)";')
w("\t\t\t\tCODE_SIGN_STYLE = Automatic;")
w("\t\t\t\tCURRENT_PROJECT_VERSION = 1;")
w("\t\t\t\tGENERATE_INFOPLIST_FILE = YES;")
w("\t\t\t\tMARKETING_VERSION = 1.0.0;")
w(f'\t\t\t\tPRODUCT_BUNDLE_IDENTIFIER = "co.tribai.app.tests";')
w(f'\t\t\t\tPRODUCT_NAME = "$(TARGET_NAME)";')
w('\t\t\t\tSWIFT_EMIT_LOC_STRINGS = NO;')
w('\t\t\t\tTARGETED_DEVICE_FAMILY = "1,2";')
w(f'\t\t\t\tTEST_HOST = "$(BUILT_PRODUCTS_DIR)/SuperAppTributaria.app/$(BUNDLE_EXECUTABLE_FOLDER_PATH)/SuperAppTributaria";')
w("\t\t\t};")
w("\t\t\tname = Debug;")
w("\t\t};")

# Test Release
w(f"\t\t{TEST_RELEASE_ID} /* Release */ = {{")
w("\t\t\tisa = XCBuildConfiguration;")
w("\t\t\tbuildSettings = {")
w(f'\t\t\t\tBUNDLE_LOADER = "$(TEST_HOST)";')
w("\t\t\t\tCODE_SIGN_STYLE = Automatic;")
w("\t\t\t\tCURRENT_PROJECT_VERSION = 1;")
w("\t\t\t\tGENERATE_INFOPLIST_FILE = YES;")
w("\t\t\t\tMARKETING_VERSION = 1.0.0;")
w(f'\t\t\t\tPRODUCT_BUNDLE_IDENTIFIER = "co.tribai.app.tests";')
w(f'\t\t\t\tPRODUCT_NAME = "$(TARGET_NAME)";')
w('\t\t\t\tSWIFT_EMIT_LOC_STRINGS = NO;')
w('\t\t\t\tTARGETED_DEVICE_FAMILY = "1,2";')
w(f'\t\t\t\tTEST_HOST = "$(BUILT_PRODUCTS_DIR)/SuperAppTributaria.app/$(BUNDLE_EXECUTABLE_FOLDER_PATH)/SuperAppTributaria";')
w("\t\t\t};")
w("\t\t\tname = Release;")
w("\t\t};")

# UI Test Debug
w(f"\t\t{UITEST_DEBUG_ID} /* Debug */ = {{")
w("\t\t\tisa = XCBuildConfiguration;")
w("\t\t\tbuildSettings = {")
w("\t\t\t\tCODE_SIGN_STYLE = Automatic;")
w("\t\t\t\tCURRENT_PROJECT_VERSION = 1;")
w("\t\t\t\tGENERATE_INFOPLIST_FILE = YES;")
w("\t\t\t\tMARKETING_VERSION = 1.0.0;")
w(f'\t\t\t\tPRODUCT_BUNDLE_IDENTIFIER = "co.tribai.app.uitests";')
w(f'\t\t\t\tPRODUCT_NAME = "$(TARGET_NAME)";')
w('\t\t\t\tSWIFT_EMIT_LOC_STRINGS = NO;')
w('\t\t\t\tTARGETED_DEVICE_FAMILY = "1,2";')
w(f'\t\t\t\tTEST_TARGET_NAME = "{APP_TARGET}";')
w("\t\t\t};")
w("\t\t\tname = Debug;")
w("\t\t};")

# UI Test Release
w(f"\t\t{UITEST_RELEASE_ID} /* Release */ = {{")
w("\t\t\tisa = XCBuildConfiguration;")
w("\t\t\tbuildSettings = {")
w("\t\t\t\tCODE_SIGN_STYLE = Automatic;")
w("\t\t\t\tCURRENT_PROJECT_VERSION = 1;")
w("\t\t\t\tGENERATE_INFOPLIST_FILE = YES;")
w("\t\t\t\tMARKETING_VERSION = 1.0.0;")
w(f'\t\t\t\tPRODUCT_BUNDLE_IDENTIFIER = "co.tribai.app.uitests";')
w(f'\t\t\t\tPRODUCT_NAME = "$(TARGET_NAME)";')
w('\t\t\t\tSWIFT_EMIT_LOC_STRINGS = NO;')
w('\t\t\t\tTARGETED_DEVICE_FAMILY = "1,2";')
w(f'\t\t\t\tTEST_TARGET_NAME = "{APP_TARGET}";')
w("\t\t\t};")
w("\t\t\tname = Release;")
w("\t\t};")

w("/* End XCBuildConfiguration section */")
w("")

# ─── XCConfigurationList ───
w("/* Begin XCConfigurationList section */")

w(f"\t\t{PROJECT_CONFIGLIST_ID} /* Build configuration list for PBXProject */ = {{")
w("\t\t\tisa = XCConfigurationList;")
w("\t\t\tbuildConfigurations = (")
w(f"\t\t\t\t{PROJECT_DEBUG_ID},")
w(f"\t\t\t\t{PROJECT_RELEASE_ID},")
w("\t\t\t);")
w("\t\t\tdefaultConfigurationIsVisible = 0;")
w("\t\t\tdefaultConfigurationName = Release;")
w("\t\t};")

w(f"\t\t{APP_CONFIGLIST_ID} /* Build configuration list for PBXNativeTarget */ = {{")
w("\t\t\tisa = XCConfigurationList;")
w("\t\t\tbuildConfigurations = (")
w(f"\t\t\t\t{APP_DEBUG_ID},")
w(f"\t\t\t\t{APP_RELEASE_ID},")
w("\t\t\t);")
w("\t\t\tdefaultConfigurationIsVisible = 0;")
w("\t\t\tdefaultConfigurationName = Release;")
w("\t\t};")

w(f"\t\t{TEST_CONFIGLIST_ID} /* Build configuration list for PBXNativeTarget */ = {{")
w("\t\t\tisa = XCConfigurationList;")
w("\t\t\tbuildConfigurations = (")
w(f"\t\t\t\t{TEST_DEBUG_ID},")
w(f"\t\t\t\t{TEST_RELEASE_ID},")
w("\t\t\t);")
w("\t\t\tdefaultConfigurationIsVisible = 0;")
w("\t\t\tdefaultConfigurationName = Release;")
w("\t\t};")

w(f"\t\t{UITEST_CONFIGLIST_ID} /* Build configuration list for PBXNativeTarget */ = {{")
w("\t\t\tisa = XCConfigurationList;")
w("\t\t\tbuildConfigurations = (")
w(f"\t\t\t\t{UITEST_DEBUG_ID},")
w(f"\t\t\t\t{UITEST_RELEASE_ID},")
w("\t\t\t);")
w("\t\t\tdefaultConfigurationIsVisible = 0;")
w("\t\t\tdefaultConfigurationName = Release;")
w("\t\t};")

w("/* End XCConfigurationList section */")
w("")

# ─── XCRemoteSwiftPackageReference ───
w("/* Begin XCRemoteSwiftPackageReference section */")

w(f"\t\t{PKG_MARKDOWN_ID} /* swift-markdown-ui */ = {{")
w("\t\t\tisa = XCRemoteSwiftPackageReference;")
w('\t\t\trepositoryURL = "https://github.com/gonzalezreal/swift-markdown-ui.git";')
w("\t\t\trequirement = {")
w("\t\t\t\tkind = upToNextMajorVersion;")
w('\t\t\t\tminimumVersion = "2.4.0";')
w("\t\t\t};")
w("\t\t};")

w(f"\t\t{PKG_KEYCHAIN_ID} /* KeychainAccess */ = {{")
w("\t\t\tisa = XCRemoteSwiftPackageReference;")
w('\t\t\trepositoryURL = "https://github.com/kishikawakatsumi/KeychainAccess.git";')
w("\t\t\trequirement = {")
w("\t\t\t\tkind = upToNextMajorVersion;")
w('\t\t\t\tminimumVersion = "4.2.2";')
w("\t\t\t};")
w("\t\t};")

w("/* End XCRemoteSwiftPackageReference section */")
w("")

# ─── XCSwiftPackageProductDependency ───
w("/* Begin XCSwiftPackageProductDependency section */")

w(f"\t\t{PKG_MARKDOWN_PRODUCT_ID} /* MarkdownUI */ = {{")
w("\t\t\tisa = XCSwiftPackageProductDependency;")
w(f"\t\t\tpackage = {PKG_MARKDOWN_ID};")
w('\t\t\tproductName = MarkdownUI;')
w("\t\t};")

w(f"\t\t{PKG_KEYCHAIN_PRODUCT_ID} /* KeychainAccess */ = {{")
w("\t\t\tisa = XCSwiftPackageProductDependency;")
w(f"\t\t\tpackage = {PKG_KEYCHAIN_ID};")
w('\t\t\tproductName = KeychainAccess;')
w("\t\t};")

w("/* End XCSwiftPackageProductDependency section */")
w("")

# ─── Close ───
w("\t};")
w(f"\trootObject = {PROJECT_ID};")
w("}")

# ─── Write file ───
xcodeproj_dir = os.path.join(PROJECT_ROOT, "SuperAppTributaria.xcodeproj")
os.makedirs(xcodeproj_dir, exist_ok=True)
pbxproj_path = os.path.join(xcodeproj_dir, "project.pbxproj")

with open(pbxproj_path, 'w') as f:
    f.write('\n'.join(lines))

# Write xcschememanagement.plist
schemes_dir = os.path.join(xcodeproj_dir, "xcshareddata", "xcschemes")
os.makedirs(schemes_dir, exist_ok=True)

scheme_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<Scheme
   LastUpgradeVersion = "1620"
   version = "1.7">
   <BuildAction
      parallelizeBuildables = "YES"
      buildImplicitDependencies = "YES">
      <BuildActionEntries>
         <BuildActionEntry
            buildForTesting = "YES"
            buildForRunning = "YES"
            buildForProfiling = "YES"
            buildForArchiving = "YES"
            buildForAnalyzing = "YES">
            <BuildableReference
               BuildableIdentifier = "primary"
               BlueprintIdentifier = "{APP_TARGET_ID}"
               BuildableName = "{APP_TARGET}.app"
               BlueprintName = "{APP_TARGET}"
               ReferencedContainer = "container:SuperAppTributaria.xcodeproj">
            </BuildableReference>
         </BuildActionEntry>
      </BuildActionEntries>
   </BuildAction>
   <TestAction
      buildConfiguration = "Debug"
      selectedDebuggerIdentifier = "Xcode.DebuggerFoundation.Debugger.LLDB"
      selectedLauncherIdentifier = "Xcode.DebuggerFoundation.Launcher.LLDB"
      shouldUseLaunchSchemeArgsEnv = "YES"
      shouldAutocreateTestPlan = "YES">
      <Testables>
         <TestableReference
            skipped = "NO">
            <BuildableReference
               BuildableIdentifier = "primary"
               BlueprintIdentifier = "{TEST_TARGET_ID}"
               BuildableName = "{TEST_TARGET}.xctest"
               BlueprintName = "{TEST_TARGET}"
               ReferencedContainer = "container:SuperAppTributaria.xcodeproj">
            </BuildableReference>
         </TestableReference>
         <TestableReference
            skipped = "NO">
            <BuildableReference
               BuildableIdentifier = "primary"
               BlueprintIdentifier = "{UITEST_TARGET_ID}"
               BuildableName = "{UITEST_TARGET}.xctest"
               BlueprintName = "{UITEST_TARGET}"
               ReferencedContainer = "container:SuperAppTributaria.xcodeproj">
            </BuildableReference>
         </TestableReference>
      </Testables>
   </TestAction>
   <LaunchAction
      buildConfiguration = "Debug"
      selectedDebuggerIdentifier = "Xcode.DebuggerFoundation.Debugger.LLDB"
      selectedLauncherIdentifier = "Xcode.DebuggerFoundation.Launcher.LLDB"
      launchStyle = "0"
      useCustomWorkingDirectory = "NO"
      ignoresPersistentStateOnLaunch = "NO"
      debugDocumentVersioning = "YES"
      debugServiceExtension = "internal"
      allowLocationSimulation = "YES">
      <BuildableProductRunnable
         runnableDebuggingMode = "0">
         <BuildableReference
            BuildableIdentifier = "primary"
            BlueprintIdentifier = "{APP_TARGET_ID}"
            BuildableName = "{APP_TARGET}.app"
            BlueprintName = "{APP_TARGET}"
            ReferencedContainer = "container:SuperAppTributaria.xcodeproj">
         </BuildableReference>
      </BuildableProductRunnable>
   </LaunchAction>
   <ProfileAction
      buildConfiguration = "Release"
      shouldUseLaunchSchemeArgsEnv = "YES"
      savedToolIdentifier = ""
      useCustomWorkingDirectory = "NO"
      debugDocumentVersioning = "YES">
      <BuildableProductRunnable
         runnableDebuggingMode = "0">
         <BuildableReference
            BuildableIdentifier = "primary"
            BlueprintIdentifier = "{APP_TARGET_ID}"
            BuildableName = "{APP_TARGET}.app"
            BlueprintName = "{APP_TARGET}"
            ReferencedContainer = "container:SuperAppTributaria.xcodeproj">
         </BuildableReference>
      </BuildableProductRunnable>
   </ProfileAction>
   <AnalyzeAction
      buildConfiguration = "Debug">
   </AnalyzeAction>
   <ArchiveAction
      buildConfiguration = "Release"
      revealArchiveInOrganizer = "YES">
   </ArchiveAction>
</Scheme>
"""

with open(os.path.join(schemes_dir, f"{APP_TARGET}.xcscheme"), 'w') as f:
    f.write(scheme_content)

print(f"Generated {pbxproj_path}")
print(f"Generated scheme at {schemes_dir}/{APP_TARGET}.xcscheme")
print(f"Total files in project: {len(app_files)} app + {len(test_files)} test + {len(uitest_files)} UI test")
print(f"\nOpen: open SuperAppTributaria.xcodeproj")
