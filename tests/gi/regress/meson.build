regress_lib = gi_dep.get_variable('regress_lib')
regress_typelib = gi_dep.get_variable('regress_typelib')

regress_env = environment()
regress_env.append('LD_LIBRARY_PATH', fs.parent(regress_lib.full_path()))
regress_env.append('GI_TYPELIB_PATH', fs.parent(regress_typelib.full_path()))

test(
  'regress',
  deno,
  suite: 'gi',
  args: [
    'test',
    '--allow-ffi',
    '--unstable-ffi',
    files('regress.ts')
  ],
  env: regress_env,
)
