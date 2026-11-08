# Device-local reusable assets
Assets supports import, previews, category/tag search, favourites, version records, source/licence metadata and explicit rights approval. Importing the same filename creates a new immutable ID/version in the same family. Page compositions embed the chosen version so changing another library item cannot silently alter an approved page.

SVG import deliberately supports self-contained primitive paths, groups, shapes and basic transforms. Scripts, foreignObject, styles, external URLs, images, XML declarations/entities and SVG text are rejected. Convert lettering to outlines before import. Colour fills/strokes are rejected; supported monochrome values normalize to black/white. Validation runs again on the Worker and stored hashes are verified when exporting.

PNG/JPEG/WebP inputs below 3 MB are decoded locally, flattened to white, thresholded and converted to a monochrome vector mask with a maximum 160-cell dimension. This suits small simple icons, not detailed high-resolution commercial artwork. SVG is preferred for finished line art. Source type/name, licence note, timestamp and the normalized asset's SHA-256 are retained.

Reusable categories cover characters, environments, buildings, props, decoration, puzzle components, frames and text templates. Six built-in original character placeholders are available directly from the canvas library: knight, dragon, princess, robot, fairy and teddy bear. Future character/scene tools can resolve the existing identity, pose, expression, facing, role and asset references. No paid generation or external asset service is connected.

Human rights approval requires a note. Approving a page does not automatically approve imported assets. My assets → Refresh asset reviews imports matching-version/hash approvals from the library into a draft. Final publication rejects missing rights approval. These records do not constitute legal clearance.
