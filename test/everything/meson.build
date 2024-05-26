# test_girscanner = find_program('g-ir-scanner', native: true, required : true)
# test_gircompiler = find_program('g-ir-compiler', native: false, required : true)

# gi_docgen_dep = subproject('gi-docgen')
gi_dep = subproject('gobject-introspection')

everything_lib = gi_dep.get_variable('everything_lib')
everything_files = gi_dep.get_variable('test_everything_files')
test_regress_incdirs = gi_dep.get_variable('test_regress_incdirs')

everything_targets = gnome.generate_gir(
  everything_lib,
  namespace: 'Everything',
  nsversion: '1.0',
  sources: everything_files,
  include_directories: test_regress_incdirs
)

everything_typelib = everything_targets[0]

everything_env = environment()
everything_env.append('PKG_CONFIG_PATH', fs.parent(everything_lib.full_path()))
everything_env.append('GI_TYPELIB_PATH', fs.parent(everything_typelib.full_path()))

run_everything = custom_target(
  'everything.ts',
  input: files('everything.ts'),
  output: ['everything.ts'],
  command: [deno, 'run', '-A', '--unstable-ffi', '@INPUT@'],
  env: everything_env,
  depends: everything_targets,
)

test(
  'everything',
  deno,
  args: [
    'test',
    '--allow-ffi',
    '--unstable-ffi',
    files('everything.ts')
  ],
  env: everything_env,
  depends: everything_targets,
)
