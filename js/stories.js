"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}


/**  generateStar helper function for generating appropriate markup
 * based on user login status and story's current favorite status
 *
 * -- generates no star if logged out
 * -- generates filled star if favorite
 * -- generates empty star if not favorited
 *
*/  // TODO: add returns CSS classes

function generateStar(story) {  // TODO: getStar instead of generate
  //if currently logged out - do this
  if (!(currentUser instanceof User)) {
    return '';
  }

  //if currently logged in - do this
  if (currentUser.favorites.some((obj) => (obj.storyId === story.storyId))) {
    //generate a filled star
    return "bi bi-star-fill";
  }
  else {
    //generate an empty star
    return "bi bi-star";
  }
}


/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  const generatedStar = generateStar(story);

  return $(`
      <li id="${story.storyId}" data-story-id="${story.storyId}">
        <span class="star">
          <i class="${generatedStar}"></i>
        </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}
// Commented out potential alternative for put favorites on page
// /** hide unfavorited stories */
// function hideUnfavoritedStories(){
//   $allStoriesList.filter(() => )
// }

function putFavoritesOnPage(){
  console.debug("putFavoritessOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

$navFavoritesLink.on("click", putFavoritesOnPage);

/** Gets values from user story on submit event and adds story to page */
async function submitNewStory(evt) {
  evt.preventDefault();

  $(evt.target).contents().find("#new-story-title").val();

  // get data from the form
  const userInputStory = {
    title: $newStoryTitle.val(),
    author: $newStoryAuthor.val(),
    url: $newStoryUrl.val(),
  };

  // call .addStory method with user, object of newStory
  const newStory = await storyList.addStory(currentUser, userInputStory);

  // put new story on page
  const storyForSubmission = generateStoryMarkup(newStory);
  $allStoriesList.prepend(storyForSubmission);

  //clear values
  $newStoryTitle.val(""),
  $newStoryAuthor.val(""),
  $newStoryUrl.val(""),

  $newStoryForm.hide();
}

$("#new-story-form").on("submit", submitNewStory);

/** toggleStoryFavorites
 * listens for click event on favorites star
 * gets storyId from that star (closest?)
 * determine if that story instance is in the users favroites list
 * invoke either favorite or unfavorite story as a result
 */

function toggleStoryFavorite(evt) {
  const storyId = $(evt.target).closest("[data-story-id]").data('story-id');
  const storyClickedOn = storyList.stories.find((obj) => (obj.storyId === storyId));
  const $starIcon = $(evt.target).closest("[data-story-id]").contents().find("i");
  // TODO:  Add event listener to i tag directly, get rid of span tag

  if (currentUser.favorites.some((favStory) => (favStory.storyId === storyId))) {
    currentUser.unFavoriteStory(storyClickedOn); // TODO: unmarkAsFavorite

    //change the star from filled to unfilled
    $starIcon.attr("class", "bi bi-star");
  }
  else {
    currentUser.favoriteStory(storyClickedOn); // TODO: markAsFavorite

    //change the star from unfilled to filled
    $starIcon.attr("class", "bi bi-star-fill");
  }
}

$("#all-stories-list").on("click", ".star", toggleStoryFavorite);

