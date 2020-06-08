import * as ActionTypes from "./ActionTypes";

export const comments = (state = { errMess: null, comments: [] }, action) => {
  switch (action.type) {
    case ActionTypes.ADD_COMMENTS:
      return { ...state, errMess: null, comments: action.payload };

    case ActionTypes.COMMENTS_FAILED:
      return { ...state, errMess: action.payload };

    case ActionTypes.ADD_COMMENT:
      let tempComments = state.comments;
      let newComment = {
        id: tempComments.length,
        author: action.payload.author,
        comment: action.payload.comment,
        date: new Date(),
        dishId: action.payload.dishId,
        rating: action.payload.rating,
      };
      tempComments.push(newComment);
      return { ...state, errMess: null, comments: tempComments };

    default:
      return state;
  }
};
