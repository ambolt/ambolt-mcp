// Minimal JSON-Schema subset (object/string/number/integer/boolean/array, enum, min/max, pattern, default).
// Enough for tool inputs; keeps the factory dependency-free. Returns { value } or { error }.
export function validate(schema, input) {
  const errors = [];
  const out = walk(schema, input, '$', errors);
  return errors.length ? { error: errors.join('; ') } : { value: out };
}

function walk(s, v, path, errors) {
  if (v === undefined || v === null) {
    if (s.default !== undefined) return s.default;
    return v;
  }
  switch (s.type) {
    case 'object': {
      if (typeof v !== 'object' || Array.isArray(v)) return err(errors, path, 'must be an object');
      const out = {};
      const props = s.properties ?? {};
      for (const k of s.required ?? []) {
        if (v[k] === undefined && props[k]?.default === undefined) errors.push(`${path}.${k} is required`);
      }
      for (const [k, ps] of Object.entries(props)) {
        const r = walk(ps, v[k], `${path}.${k}`, errors);
        if (r !== undefined) out[k] = r;
      }
      if (s.additionalProperties === false) {
        for (const k of Object.keys(v)) if (!(k in props)) errors.push(`${path}.${k} is not allowed`);
      }
      return out;
    }
    case 'string':
      if (typeof v !== 'string') return err(errors, path, 'must be a string');
      if (s.enum && !s.enum.includes(v)) errors.push(`${path} must be one of ${s.enum.join(', ')}`);
      if (s.pattern && !new RegExp(s.pattern, 'u').test(v)) errors.push(`${path} does not match ${s.pattern}`);
      if (s.maxLength && v.length > s.maxLength) errors.push(`${path} is too long`);
      return v;
    case 'integer':
    case 'number': {
      if (typeof v !== 'number' || !Number.isFinite(v)) return err(errors, path, 'must be a number');
      if (s.type === 'integer' && !Number.isInteger(v)) errors.push(`${path} must be an integer`);
      if (s.minimum !== undefined && v < s.minimum) errors.push(`${path} must be >= ${s.minimum}`);
      if (s.maximum !== undefined && v > s.maximum) errors.push(`${path} must be <= ${s.maximum}`);
      return v;
    }
    case 'boolean':
      return typeof v === 'boolean' ? v : err(errors, path, 'must be a boolean');
    case 'array': {
      if (!Array.isArray(v)) return err(errors, path, 'must be an array');
      if (s.maxItems && v.length > s.maxItems) errors.push(`${path} has too many items`);
      return v.map((x, i) => walk(s.items ?? {}, x, `${path}[${i}]`, errors));
    }
    default:
      return v;
  }
}

function err(errors, path, msg) {
  errors.push(`${path} ${msg}`);
  return undefined;
}
