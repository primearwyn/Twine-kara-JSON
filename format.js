window.storyFormat({
	"name": "TwineKara",
	"version": "0.2.6",
	"author": "Armand Accrombessi",
	"description": "Export your Twine 2 story as a JSON document, based on JTwine-To-JSON",
	"proofing": false,
	"source": `
<html> 
	<head>
		<meta http-equiv='Content-Type' content='text/html; charset=UTF-8' />
		<title>TwineKara</title>
    	<script type='text/javascript'>
/**
* TwineKara: forked from JTwine-To-JSON by Jason Francis 
*
* Source repo [here](https://github.com/BL-MSCH-C220/JTwine-to-JSON)
*
* Originally adapted from [twine-to-json](https://jtschoonhoven.github.io/twine-to-json/)
*
* Copyright (c) 2024 Armand Accrombessi
*
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
* associated documentation files (the 'Software'), to deal in the Software without restriction,
* including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
* and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
* subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all copies or substantial
* portions of the Software.
*
* THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
* LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
* IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
* SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
const STORY_TAG_NAME = 'tw-storydata';
const PASSAGE_TAG_NAME = 'tw-passagedata';
const FORMAT_TWINE = 'twine';
const FORMAT_HARLOWE_3 = 'harlowe-3';
const VALID_FORMATS = [FORMAT_TWINE, FORMAT_HARLOWE_3];

const END_DECL = '\\n';
/**
 * Convert Twine story to JSON.
 */
function twineToJSON(format) {
	const storyElement = document.querySelector(STORY_TAG_NAME);
	const storyMeta = getElementAttributes(storyElement);
	const result = {
		story: storyMeta.name,
		startnode: storyMeta.startnode		
	};
	validate(format);
	const passageElements = Array.from(storyElement.querySelectorAll(PASSAGE_TAG_NAME));
	result.passages = passageElements.map(pEl => processPassageElement(pEl, format));

	for (i in result.passages){
		p = result.passages[i];
		for (j in p.links){
			l = p.links[j];
			temp = parseInt(j) + 1
			l.selection = temp.toString();

			n = l.newPassage;
			for (k in result.passages){
				s = result.passages[k];
				if (s.name == n){
					l.pid = s.pid
				}
			}
		}
	}
	return result;
}
/**
 * Validate story and inputs. Currently this only validates the format arg. TODO: make this more robust.
 */
function validate(format) {
	const isValidFormat = VALID_FORMATS.some(validFormat => validFormat === format);
	if (!isValidFormat) {
		throw new Error('Format is not valid.');
	}
}
/**
 * Convert the HTML element for a story passage to JSON.
 */
function processPassageElement(passageElement, format) {
	const passageMeta = getElementAttributes(passageElement);
	const result = {
		name: passageMeta.name,
		tags: passageMeta.tags,
		pid: passageMeta.pid,
	};
	result.original = passageElement.innerText.trim();
	Object.assign(result, processPassageText(result.original, format));
	result.text = sanitizeText(result.original, result.links, result.vars, result.hooks, format);
	return result;
}

function processPassageText(passageText, format) {
	const result = { links: [], vars: [], data: {} };
	if (format === FORMAT_HARLOWE_3) {
		result.hooks = [];
	}
	let currentIndex = 0;
	while (currentIndex < passageText.length) {
		const maybeLink = extractLinksAtIndex(passageText, currentIndex);
		if (maybeLink) {
			result.links.push(maybeLink);
			currentIndex += maybeLink.original.length;
		}

		const maybeVar = extractVarsAtIndex(passageText, currentIndex);
		if (maybeVar) {
			result.vars.push(maybeVar);
			result.data[maybeVar.key]=JSON.parse(maybeVar.value);
			currentIndex += maybeVar.original.length;
		}

		if (format !== FORMAT_HARLOWE_3) {
			currentIndex++;
			continue;
		}

		const maybeLeftHook = extractLeftHooksAtIndex(passageText, currentIndex);
		if (maybeLeftHook) {
			result.hooks.push(maybeLeftHook);
			currentIndex += maybeLeftHook.original.length;
		}
		currentIndex++;
		const maybeHook = extractHooksAtIndex(passageText, currentIndex);
		if (maybeHook) {
			result.hooks.push(maybeHook);
			currentIndex += maybeHook.original.length;
		}
	}
	return result;
}
function extractLinksAtIndex(passageText, currentIndex) {
	const currentChar = passageText[currentIndex];
	const nextChar = passageText[currentIndex + 1];
	if (currentChar === '[' && nextChar === '[') {
		const link = getSubstringBetweenBrackets(passageText, currentIndex + 1);
		const leftSplit = link.split('<-', 2);
		const rightSplit = link.split('->', 2);
		const original = passageText.substring(currentIndex, currentIndex + link.length + 4);
		if (leftSplit.length === 2) {
			return { original: original, label: leftSplit[1], newPassage: leftSplit[0], pid: "", selection: "" };
		}
		else if (rightSplit.length === 2) {
			return { original: original, label: rightSplit[0], newPassage: rightSplit[1], pid: "", selection: "" };
		}
		else {
			return { original: original, label: link, newPassage: link, pid: "", selection: "" };
		}
	}
}
function extractVarsAtIndex(passageText, currentIndex) {
	const currentChar = passageText[currentIndex];
	const nextChar = passageText[currentIndex + 1];

	if ((currentChar === '$' && nextChar === '$') 
	||  (currentChar === '_' && nextChar === '_')) {

		const declaration = getSubstringBetweenBrackets(passageText, currentIndex + 1, nextChar, END_DECL);
		const [key, value] = declaration.split('=', 2);
		const original = passageText.substring(currentIndex, currentIndex + declaration.length + 2);

		return { original: original, key: key.trim(), value: value.trim(), temp: (currentChar === '_') };
	}
}
function extractLeftHooksAtIndex(passageText, currentIndex) {
	const regexAlphaNum = /[a-z0-9]+/i;
	const currentChar = passageText[currentIndex];
	if (currentChar === '|') {
		const maybeHookName = getSubstringBetweenBrackets(passageText, currentIndex, '|', '>');
		if (maybeHookName.match(regexAlphaNum)) {
			const hookStartIndex = currentIndex + maybeHookName.length + 2; // advance to next char after ">"
			const hookStartChar = passageText[hookStartIndex];
			if (hookStartChar === '[') {
				const hookText = getSubstringBetweenBrackets(passageText, hookStartIndex);
				const hookEndIndex = hookStartIndex + hookText.length + 2;
				const original = passageText.substring(currentIndex, hookEndIndex);
				return { hookName: maybeHookName, hookText: hookText, original: original };
			}
		}
	}
}
function extractHooksAtIndex(passageText, currentIndex) {
	const regexAlphaNum = /[a-z0-9]+/i;
	const currentChar = passageText[currentIndex];
	const nextChar = passageText[currentIndex + 1];
	const prevChar = currentIndex && passageText[currentIndex - 1];
	if (currentChar === '[' && nextChar !== '[' && prevChar !== '[') {
		const hookText = getSubstringBetweenBrackets(passageText, currentIndex);
		const hookEndIndex = currentIndex + hookText.length + 2;
		const hookEndChar = passageText[hookEndIndex];
		if (hookEndChar === '<') {
			const maybeHookName = getSubstringBetweenBrackets(passageText, hookEndIndex, '<', '|');
			if (maybeHookName.match(regexAlphaNum)) {
				const original = passageText.substring(currentIndex, hookEndIndex + maybeHookName.length + 2);
				return { hookName: maybeHookName, hookText: hookText, original: original };
			}
		}
		const original = passageText.substring(currentIndex, hookText.length + 2);
		return { hookName: undefined, hookText: hookText, original: original };
	}
}
function sanitizeText(passageText, links, vars, hooks, format) {
	links.forEach((link) => {
		passageText = passageText.replace(link.original, '');
	});
	vars.forEach((v) => {
		passageText = passageText.replace(v.original+END_DECL, '');
	});
	if (format === FORMAT_HARLOWE_3) {
		hooks.forEach((hook) => {
			passageText = passageText.replace(hook.original, '');
		});
	}
	return passageText.trim();
}
/**
 * Convert an HTML element to an object of attribute values.
 */
function getElementAttributes(element) {
	const result = {};
	const attributes = Array.from(element.attributes);
	attributes.forEach((attribute) => {
		result[attribute.name] = attribute.value;
	});
	return result;
}
/**
 * True if string starts with the given substring.
 */
function stringStartsWith(string, startswith) {
	return string.trim().substring(0, startswith.length) === startswith;
}
function getSubstringBetweenBrackets(string, startIndex, openBracket, closeBracket) {
	openBracket = openBracket ?? '[';
	closeBracket = closeBracket ?? ']';
	const bracketStack = [];
	let currentIndex = startIndex ?? 0;
	let substring = '';
	if (string[currentIndex] !== openBracket) {
		throw new Error('startIndex of getSubstringBetweenBrackets must correspond to an open bracket');
	}
	while (currentIndex < string.length) {
		const currentChar = string[currentIndex];
		// pull top bracket from stack if we hit a close bracket
		if (currentChar === closeBracket) {
			bracketStack.pop();
		}
		// build substring so long as stack is populated
		if (bracketStack.length) {
			substring += currentChar;
		}
		// add open brackets to the top of the stack
		if (currentChar === openBracket) {
			bracketStack.push(currentChar);
		}
		// return if stack is empty and substring is set
		if (!bracketStack.length) {
			return substring;
		}
		currentIndex++;
	}
	return substring;
}
        </script>
	</head>
	<body>
        <pre id='content'></pre>
        <div id='storyData' style='display: none;'>{{STORY_DATA}}</div>
        <script type='text/javascript'>document.querySelector('#content').innerHTML = JSON.stringify(twineToJSON("twine"), null, "\t");</script>
	</body>
</html>
	`
  });
