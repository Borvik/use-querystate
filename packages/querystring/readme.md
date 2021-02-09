# Introduction

Skip to the [format](#format) and [api](#api)

> _tl;dr_: This is a custom format that _**mostly**_ follows RFC specs and isn't compatible with most other query string parsers.

Yes, this is another query string library - I found most existing ones not fully capable of what I wanted to do.

This is an _opinionated_ query string builder/parser.  This means that it will not handle a number of valid query strings in favor of parsing the format it itself would generate.  And while this works in the browser it was designed to work _with_ a server that can have  it's query parsing controlled - like NodeJS.

This query string builder/parser was actually constructed as an attempt to serialized objects and arrays in as concise a format as I could construct while also keeping the query string as readable as possible (which means using a `+` instead of a `%20`).

After an analysis of the spec I determined there were a number of characters that normally get encoded, but are actually valid characters for the query string - though _semi-reserved_.

Most encoding functions err on the side of percent encoding characters that are in fact permissible - I'm not saying they are wrong as percent encoding works - I just didn't like how the separator characters look and decided to dig into RFC3986.

According to the RFC:

> The query component is indicated by the first question mark ("?") character and terminated by a number sign ("#") character or by the end of the URI.

So according to that only the `#` really needs to be percent encoded so the end of the query component doesn't get misread.  But let's dig further.

In ABNF the permissible character between those to are:

`query       = *( pchar / "/" / "?" )` - read "any pchar _or_ / _or_ ?"

So what's `pchar`?  `pchar` actually has other codes in it so now I will break down all the parts and then summarize them.

```
pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
pct-encoded   = "%" HEXDIG HEXDIG
sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
                 / "*" / "+" / "," / ";" / "="
```

`ALPHA`, `DIGIT`, and `HEXDIG` are actually defined in RFC2234 and I will just post their comment as it's more readable.

```
ALPHA         = A-Z / a-z
DIGIT         = 0-9
HEXDIG        = DIGIT / "A" / "B" / "C" / "D" / "E" / "F"
```

So combining all the above rules we can conclude that the follow are allowed characters in the query string (I'm not going to expand `pct-encoded` as anybody who has understood this so far would probably just find that easier to read): `A-Z / a-z / 0-9 / "-" / "." / "_" / "~" / pct-encoded / "!" / "$" / "&" / "'" / "(" / ")" / "*" / "+" / "," / ";" / "=" / ":" / "@"`

> NOTE: Square brackets are missing from this list and will get percent encoded by this library.

Some of those are widely known in the query string namely: `&`, `=`, and `+`.

According to the RFC on reserved characters:

> URI producing applications should percent-encode data octets that correspond to characters in the reserved set _**unless these characters are specifically allowed by the URI scheme to represent data in that component**_.

While the browser is the application passing the query string around, it doesn't usually _parse_ the query string, just supply it to ECMAScript or pass it to the server - the _real_ application is the website/server. With this the developer is assigning meaning to those separators and allowing it for this applications URI scheme.

> NOTE: Yes, based on all the above I could technically use ANY character for separating and eschew percent encoding in favor of a homebrew method.  In this I tried to follow the RFC as best I could, while taking liberties where it seemed allowed. So when I use a sub-delimiter it is actually a delimiter.

# Format

`encodeURIComponent` is used to encode parts - but it needs some help to cover this libraries needs, namely using `+` instead of `%20` for a space, and percent encoding `(` and `)` which it doesn't do natively.  `Boolean` types will be converted to `1` or `0`.

Special characters and their meaning:

`=` - top level separator between a key and value\
`&` - top level separator between key/value sets\
`,` - array value separator\
`:` - object separator between a key and value\
`;` - object separator between key/value sets\
`(` - start of an object\
`)` - end of an object

> NOTE: Yes, there seems to be a "standard" around arrays using square brackets - but they were not in the list of the delimiters and often get percent encoded (while still working). I did not like how that looked, nor did I like how many characters they would end up taking - so using this - single value arrays _can't_ be decoded.

Some examples:

```javascript
// ?a=b&c=d
var qs = {
  "a": "b",
  "c": "d"
}

// ?a=b,c
qs = {
  "a", ["b", "c"]
}

// ?a=(b:c;d:e),(f:g;h:i,j)
qs = {
  "a": [
    {
      "b": "c",
      "d": "e"
    },
    {
      "f": "g",
      "h": ["i", "j"]
    }
  ]
}
```

# API

Examples are in typescript, and assume: `import { QueryString } from '@borvik/querystring';`

## `stringify`

### **Syntax**
> stringify(obj: object[, options: ParseOptions])

#### Parameters

> `obj`\
> An object to serialize to query string format

> `options`\
> Parse options to allow transforming the data to proper types\
> \
> `initialState?`: `Record<string, unknown>` Contains the initial or default state the query string holds when an expected var shouldn't exist. If a path exists in both `intialState` _and_ `obj` and the values are `equal` (strict) then the value is omitted from the serialized query string.

### **Description**

Serializes an object to the query string format.

This can handle nested objects and arrays, skipping `functions`, `Symbols`, `null` and `undefined`.

Does not prefix the query string with a question mark.

### **Examples**

```typescript
let encoded = QueryString.stringify({a: 'b'});
// encoded = "a=b"

let encoded = QueryString.stringify({page: 1, q: 'query'}, {
  initialState: { page: 1 }
});
// encoded = "q=query"
```

## `parse`

### **Syntax**
> parse(qs: string[, options: ParseOptions])

#### Parameters

> `qs`\
> A string containing the query string to parse.

> `options`\
> Parse options to allow transforming the data to proper types\
> \
> `types?`: An object containing the type definitions for the query string. Conversion will only be run if this is specified. See below for structure.\
> `definedTuples?`: Boolean indicating whether `types` contains definitions for array indicies.\
> `initialState?`: `Record<string, unknown>` Contains the initial or default state the query string holds when an expected var doesn't exist. If `types` are not defined, they can partly be derived from this.

The type definition object should mirror that of the expected input. When using this conversion feature it locks the query string to the expected definition. Missing key/values are fine, but _extra_ key/values are discarded silently. Useful if you only want _part_ of the query string.

#### Return value

Returns an object containing the values parsed from the query string, or if there was no query string an empty object.

#### Definition of `types`

A type definition may be any of `any`, `string`, `number`, `bigint`, `boolean`, `string[]`, `number[]`, `bigint[]`, or `boolean[]`.

Some example type definitions, first will show the query string, followed by a type definition.

```typescript
// ?page=1&pageSize=10
const typeDef = {
  page: 'number',
  pageSize: 'number'
}

// ?ids=1,2,3
const typeDef = {
  ids: 'number[]'
}

// ?filter=(a:1,b:1)
const typeDef = {
  filter: {
    a: 'number',
    b: 'boolean',
  }
}

// ?filter=a,1,1
const typeDef = {
  // To use this type of definition you must specify `definedTuples` as `true`
  filter: ['string', 'number', 'boolean']
}
```

### **Description**

Decodes a query string encoded with this format to an object

The leading question mark is optional.\
Single value arrays are not parseable.\
All values will be strings.

### **Examples**

```typescript
let decoded = QueryString.parse('?a=b&c=5');
// decoded = {a: 'b', c: '5'}

let decoded = QueryString.parse('?a=b&c=5&d=1,2,3&e=1', {
  types: {
    a: 'string',
    c: 'number',
    d: 'number[]',
    e: 'boolean',
  }
});
// decoded = {a: 'b', c: 5, d: [1, 2, 3], e: true}

let decoded = QueryString.parse('?filter=a,1,1', {
  definedTuples: true,
  types: {
    filter: ['string', 'number', 'boolean']
  }
});
// decoded = {filter: ['a', 1, true]}

let decoded = QueryString.parse('?a=b&c=5&e=1', {
  initialState: {
    a: 'd',
    c: 2,
    e: false
  }
});
// decoded = {a: 'b', c: 5, e: true}
// note - values of initialState aren't important, but types are
```

## `merge`

### **Syntax**
> merge(origQS: string, newValues: object[, options: MergeOptions])

#### Parameters

> `origQs`\
> A string containing the original query string to merge new values with

> `newValues`\
> An object containing new values to add to the query string

> `options`\
> Optional. A set of options to tell it _how_ to merge\
> \
> `deepMerge`: Boolean indicating that you want it to perform a deep merge. Default is `false`\
> `initialState?`: `Record<string, unknown>` Contains the initial or default state the query string holds when an expected var shouldn't exist. If a path exists in both `intialState` _and_ combined `origQs` and the values are `equal` (strict) then the value is omitted from the serialized query string. **Note:** This applies to incoming `newValues` only.

#### Return value

Returns a new query string (not prefixed with a `?`) with the merged values or an empty string.

### **Description**

Merges an existing query string, with new values to form a new query string.

This combines first calling a `parse` on the original, then merging the result with the new values, and finally calling `stringify`.

### Examples

```typescript
let merged = QueryString.merge('?a=b&c=1&d=e', {c: 2, d: null});
// merged = "a=b&c=2"

let merged = QueryString.merge('?a=(b:c;d:e,f;j:(k:l))', {g:'h', a: {b:'1',m:'o',j: {k: null}}}, { deepMerge: true });
// merged = "a=(b:1;d:e,f;m:o)&g=h"

let merged = QueryString.merge('?page=5&pageSize=10', { page: 1 }, {
  initialState: { page: 1, pageSize: 25 }
});
// merged = "pageSize=10"
```

> NOTE: In the `deepMerge` example path `a.j.k` is set to `null`, which leaves `j` an empty object so it too is removed.

# FAQ

### Why is there no question mark in the `stringify` result?

> In some cases you might want one, and others you might not. By not including it, in cases where you might want both (one with `?` and one without), rather than running serialization twice - it only happens once and the calling app can fairly easily add or not add the question mark in the appropriate spot.

### Can you support arrays with square brackets `[]`?

> Probably not going to happen - square brackets are not listed as a sub-delim in the RFC. They _are_ in there as gen-delims, but not for the query string. And while it seems `:` is also that way - note `:` is part of the `pchar` allowed in the query string. Because of this they would have to be percent encoded - which is just harder to read.