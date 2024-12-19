# TwineKara
A story format for converting a Twine 2 story to JSON with special support for Harlowe 3.x. Forked from JTwine-to-JSON.

JTwine-to-JSON makes a few useful changes to [Twine-to-JSON](https://jtschoonhoven.github.io/twine-to-json/), which was inspired by [Twison](https://github.com/lazerwalker/twison). Twison was, in turn, inspired by [Entweedle](http://www.maximumverbosity.net/twine/Entweedle/).

## Setup

From the Twine 2 homescreen, select the Twine Menu, then "Story Format". "+ Add" a New Format. At the prompt, "Paste in the address below": `https://cdn.githubraw.com/primearwyn/Twine-kara-JSON/main/format.js`


## Export

Once you’ve installed format, enter your story and choose Change Story Format. Select the new format and return to your story. Selecting Play will generate a JSON file in your browser. It can then be copied for use elsewhere.

## Example Output
```
{
  "story": "USS Enterprise",
  "startnode": "1",
  "passages": [
    {
      "name": "Bridge of the Enterprise",
      "tags": "",
      "pid": "1",
      "original": "You are standing on the bridge of the enterprise. Worf is at tactical and Data is at Conn.\n\n[[Go to the captain's ready room->Ready Room]]\n[[Go to the turbolift->Turbolift]]\n[[Go the the meeting room->Meeting Room]]",
      "links": [
        {
          "original": "[[Go to the captain's ready room->Ready Room]]",
          "label": "Go to the captain's ready room",
          "newPassage": "Ready Room",
          "pid": "2",
          "selection": "1"
        },
        {
          "original": "[[Go to the turbolift->Turbolift]]",
          "label": "Go to the turbolift",
          "newPassage": "Turbolift",
          "pid": "3",
          "selection": "2"
        },
        {
          "original": "[[Go the the meeting room->Meeting Room]]",
          "label": "Go the the meeting room",
          "newPassage": "Meeting Room",
          "pid": "4",
          "selection": "3"
        }
      ],
      "text": "You are standing on the bridge of the enterprise. Worf is at tactical and Data is at Conn."
    },
    {
      "name": "Ready Room",
      "tags": "",
      "pid": "2",
      "original": "You are standing in the Captain's ready room. Captain Picard is here drinking a cup of Earl Grey Tea, hot.\n\n[[Go to the bridge->Bridge of the Enterprise]] \n[[Replicate some tea->Ready Room with Tea]]",
      "links": [
        {
          "original": "[[Go to the bridge->Bridge of the Enterprise]]",
          "label": "Go to the bridge",
          "newPassage": "Bridge of the Enterprise",
          "pid": "1",
          "selection": "1"
        },
        {
          "original": "[[Replicate some tea->Ready Room with Tea]]",
          "label": "Replicate some tea",
          "newPassage": "Ready Room with Tea",
          "pid": "5",
          "selection": "2"
        }
      ],
      "text": "You are standing in the Captain's ready room. Captain Picard is here drinking a cup of Earl Grey Tea, hot."
    }
}
```
