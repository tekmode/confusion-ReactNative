import React, { Component } from "react";
import {Text,View,ScrollView,FlatList,Modal,StyleSheet,Button,Alert,PanResponder,Share} from "react-native";
import { Card, Icon, Rating, Input } from "react-native-elements";
import { connect } from "react-redux";
import { baseUrl } from "../shared/baseUrl";
import * as Animatable from 'react-native-animatable';
import { postFavorite, postComment } from "../redux/ActionCreators";

const mapStateToProps = (state) => {
  return {
    dishes: state.dishes,
    comments: state.comments,
    favorites: state.favorites,
  };
};
const mapDispatchToProps = (dispatch) => ({
  postFavorite: (dishId) => dispatch(postFavorite(dishId)),
  postComment: (dishId, rating, author, comment) =>
    dispatch(postComment(dishId, rating, author, comment)),
});


class DishDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      author: "",
      comment: "",
      rating: 0,
      showModal: false,
    };
  }

  static navigationOptions = {
    title: "Dish Details",
  };

  toggleModal(_this) {
    _this.setState({ showModal: !_this.state.showModal });
  }

  markFavorite(dishId) {
    this.props.postFavorite(dishId);
  }

  addComment(dishId, rating, author, comment) {
    this.props.postComment(dishId, rating, author, comment);
    this.toggleModal(this);
  }
 
  render() {
    let _this = this;
    const shareDish = (title, message, url) => {
      Share.share({
          title: title,
          message: title + ': ' + message + ' ' + url,
          url: url
      },{
          dialogTitle: 'Share ' + title
      })
  }
    const RenderDish = (props) => {
      const dish = props.dish;
    //  var handleViewRef = ref => this.view = ref;
            const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
              if ( dx < -200 )
                  return true;
              else
                  return false;
          }
          const recognizeDragleft = ({ moveX, moveY, dx, dy }) => {
            if ( dx > 200 )
                return true;
            else
                return false;
        }
              const panResponder = PanResponder.create({
                  onStartShouldSetPanResponder: (e, gestureState) => {
                      return true;
                  }, 
                   onPanResponderEnd: (e, gestureState) => {
                      console.log("pan responder end", gestureState);
                      if (recognizeDrag(gestureState))
                          Alert.alert(
                              'Add Favorite',
                              'Are you sure you wish to add ' + dish.name + ' to favorite?',
                              [
                              {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                              {text: 'OK', onPress: () => {props.favorite ? console.log('Already favorite') : props.onPress()}},
                              ],
                              { cancelable: false }
                          );
                          else if(recognizeDragleft(gestureState))
                          props.toggleModal(_this);
                      return true;
                    }
              });
    
      if (dish != null) {
        return(
            <Animatable.View animation="fadeInDown" duration={2000} delay={1000}
      //          ref={this.handleViewRef}
                {...panResponder.panHandlers}>      
          <Card featuredTitle={dish.name} image={{ uri: baseUrl + dish.image }}>
            <Text style={{ margin: 10 }}>{dish.description}</Text>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <Icon
                raised
                reverse
                name={props.favorite ? "heart" : "heart-o"}
                type="font-awesome"
                color="#f50"
                onPress={() =>
                  props.favorite
                    ? console.log("Already favorite")
                    : props.onPress()
                }
              />
              <Icon
                raised
                reverse
                name="pencil"
                type="font-awesome"
                color="#512DA8"
                onPress={() => props.toggleModal(_this)}
              />
              <Icon
               raised
               reverse
              name='share'
              type='font-awesome'
              color='#51D2A8'
              style={styles.cardItem}
              onPress={() => shareDish(dish.name, dish.description, baseUrl + dish.image)} 
              />
            </View>
          </Card>
          </Animatable.View>
        );
      } 
      else {
        return <View></View>;
      }
    };
    

    const RenderComments = (props) => {
      const comments = props.comments;

      const renderCommentItem = ({ item, index }) => {
        return (

          <View key={index} style={{ margin: 10 }}>
            <Text style={{ fontSize: 14 }}>{item.comment}</Text>
            <Rating
              showRating
              readonly
              startingValue={item.rating}
              showRating={false}
              imageSize={18}
              style={{ alignItems: "flex-start", padding: 5 }}
            />
            <Text style={{ fontSize: 12 }}>
              {"-- " + item.author + ", " + item.date}
            </Text>
          </View>
        );
      };

      return (
        <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>     
        <Card title="Comments">
          <FlatList
            data={comments}
            renderItem={renderCommentItem}
            keyExtractor={(item) => item.id.toString()}
          />
        </Card>
        </Animatable.View>
      );
    };

    const dishId = this.props.navigation.getParam("dishId", "");
    return (
      <ScrollView>
        <RenderDish
          dish={this.props.dishes.dishes[+dishId]}
          favorite={this.props.favorites.some((el) => el === dishId)}
          onPress={() => this.markFavorite(dishId)}
          toggleModal={this.toggleModal}
        />
        <RenderComments
          comments={this.props.comments.comments.filter(
            (comment) => comment.dishId === dishId
          )}
        />
   <Modal
    animationType={"slide"}
    transparent={false}
  visible={this.state.showModal}
    onDismiss={() => this.toggleModal(_this)}
    onRequestClose={() => this.toggleModal(_this)}
  >
    <View style={styles.modal}>
      <Rating
        showRating
        startingValue={this.state.rating}
        imageSize={18}
        style={{ alignItems: "center", padding: 5 }}
        onFinishRating={(rating) => {
          this.setState({ rating });
        }}
      />
      <Input
        placeholder="Author Name"
        onChangeText={(text) => {
          this.setState({ author: text });
        }}
        leftIcon={
          <Icon
            name="user-o"
            type="font-awesome"
            size={24}
            color="black"
            containerStyle={{ marginRight: 10 }}
          />
        }
      />

      <Input
        placeholder="Comment"
        onChangeText={(text) => {
          this.setState({ comment: text });
        }}
        leftIcon={
          <Icon
            name="comment-o"
            type="font-awesome"
            size={24}
            color="black"
            containerStyle={{ marginRight: 10 }}
          />
        }
      />
      <View style={{ marginBottom: 20, marginTop: 20 }}>
        <Button
          onPress={() => {
            if (this.state.author === "" || this.state.comment === "") {
              Alert.alert(
                "Invalid input",
                "Fill all the details to continue",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      return;
                    },
                  },
                ]
              );
            } else {
              this.addComment(
                dishId,
                this.state.rating,
                this.state.author,
                this.state.comment
              );
            }
          }}
          color="#512DA8"
          title="SUBMIT"
        />
      </View>
      <View>
        <Button
          onPress={() => {
            this.toggleModal(_this);
          }}
          color="#AAAAAA"
          title="CANCEL"
        />
            </View>
          </View>
        </Modal>

      </ScrollView>
      
    );
  }
}

const styles = StyleSheet.create({
  formRow: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    flexDirection: "row",
    margin: 20,
  },
  formLabel: {
    fontSize: 18,
    flex: 2,
  },
  formItem: {
    flex: 1,
  },
  modal: {
    justifyContent: "center",
    margin: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    backgroundColor: "#512DA8",
    textAlign: "center",
    color: "white",
    marginBottom: 20,
  },
  modalText: {
    fontSize: 18,
    margin: 10,
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(DishDetail);
