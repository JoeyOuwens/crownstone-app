import RNFS from 'react-native-fs'

export const groups = {

  /**
   *
   * @returns {*}
   */
  getGroups: function (options = {}) {
    return this._setupRequest('GET', '/users/{id}/groups', options);
  },

  getUsers: function (options = {}) {
    return this._setupRequest('GET', '/Groups/{id}/users', options);
  },

  getAdmins: function (options = {}) {
    return this._setupRequest('GET', '/Groups/{id}/owner', options).then((result) => {return [result]});
  },

  getMembers: function (options = {}) {
    return this._setupRequest('GET', '/Groups/{id}/members', options);
  },

  getGuests: function (options = {}) {
    return this._setupRequest('GET', '/Groups/{id}/guests', options);
  },

  getKeys: function() {
    return this._setupRequest('GET','users/{id}/keys');
  },

  /**
   *
   * @param groupName
   */
  createGroup: function(groupName) {
    return this._setupRequest('POST', 'users/{id}/groups', {data:{name:groupName}}, 'body');
  },

  getUserPicture(groupId, email, userId) {
    let toPath = RNFS.DocumentDirectoryPath + '/' + userId + '.jpg';
    return this.forGroup(groupId)._download({
      endPoint:'/Groups/{id}/profilePic',
      data: {email: email},
      type: 'query'
    }, toPath);
  },


  syncGroup: function(options, selfId) {
    let groupId = this._groupId;

    let promises     = [];

    let locationData = [];
    let adminData    = [];
    let memberData   = [];
    let guestData    = [];

    // for every group, we get the locations
    promises.push(
      this.getLocations()
        .then((locations) => {
          locationData = locations;
        })
    );

    promises.push(
      this.getUserFromType(this.getAdmins.bind(this),  'admin',  adminData,  groupId, selfId)
    );

    promises.push(
      this.getUserFromType(this.getMembers.bind(this), 'member', memberData, groupId, selfId)
    );

    promises.push(
      this.getUserFromType(this.getGuests.bind(this),  'guest',  guestData,  groupId, selfId)
    );

    return Promise.all(promises).then(() => {
      return {
        locations: locationData,
        admins:    adminData,
        members:   memberData,
        guests:    guestData,
      }
    })
  },

  getUserFromType: function(userGetter, type, userData, groupId, selfId) {
    userGetter()
      .then((users) => {
        let profilePicturePromises = [];
        users.forEach((user) => {
          userData[user.id] = user;
          userData[user.id].accessLevel = type;
          if (user.id !== selfId) {
            profilePicturePromises.push(
              this.getUserPicture(groupId, user.email, user.id).then((filename) => {
                userData[user.id].picture = filename;
              })
            );
          }
          return Promise.all(profilePicturePromises);
        })
      })
  }

};