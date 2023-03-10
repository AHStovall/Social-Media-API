const { User, Thought } = require('../models');

const thoughtController = {

//Thought CRUD

getThoughtsAll(req, res) {
    Thought.find({})
    .populate({
        path: 'reactions',
        select: '-_v', 
    })
    .select('-_v')
    .sort({ _id: -1 })
    .then(dbThoughtData => res.json(dbThoughtData))
    .catch(err => {
        console.log(err);
        res.sendStatus(400);
    });
},

getThoughtsByID({params}, res) {
    Thought.findOne({ _id: params._id })
    .populate({
        path: 'reactions',
        select: '-_v', 
    })
    .select('-_v')
    .sort({ _id: -1 })
    .then(dbThoughtData => {
    if(!dbThoughtData) {
        res.status(404).json({ message: 'No Thoughts have been found by that ID!'});
        return;
    }
    res.json(dbThoughtData);
})
    .catch(err => {
        console.log(err);
        res.sendStatus(400);
    });
},

createThought({ body }, res) {
    Thought.create(body)
    .then(({ _id}) => {
        return User.findOneAndUpdate(
            { _id: body.userId },
            {$push: {thoughts: _id }},
            { new: true }

        );
    })
    .then(dbThoughtData => {
        if(!dbThoughtData) {
        res.status(404).json({ message: 'No Thoughts have been found by that ID!'});
        return;
    }
    res.json(dbThoughtData);
})
    .catch(err => res.json(err));
},

updateThought({ params, body }, res) {
    Thought.findOneAndUpdate({ _id: params.id }, body, { 
        new: true, 
        runValidators: true
    }).then(dbThoughtData => {
        if(!dbThoughtData) {
            res.status(404).json({ message: 'No Thoughts have been found by that ID!'});
            return;
        }
        res.json(dbThoughtData);
    })
    .catch(err => res.json(err));
},

deleteThought({ params }, res) {
    Thought.findOneAndDelete({ _id: params.id })
    .then(dbThoughtData => {
        if(!dbThoughtData) {
        res.status(404).json({ message: 'No Thoughts have been found by that ID!'});
        return;
    }
    return User.findOneAndDelete(
        { _id: parmas.userId },
        { $pull: { thoughts: params.Id } },
        { new: true }
    )
}).then(dbUserData => {
    if (!dbUserData) {
      res.status(404).json({ message: 'No User found with this id!' });
      return;
    }
    res.json(dbUserData);
  })
  .catch(err => res.json(err));
},

//Reaction CRUD
createReaction({ params, body }, res) {
    Thought.findByIdAndUpdate(
        {_id: params.thoughtId}, 
        {$push: {reactions: body}}, 
        {new: true, runValidators: true})
      .populate({path: 'reactions', select: '-__v'})
      .select('-__v')
      .then(dbThoughtData => {
    if (!dbThoughtData) {
        res.status(404).json({ message: 'No Thoughts found with this id!' });
        return;
      }
      res.json(dbThoughtData);
    })
    .catch(err => res.status(400).json(err))
  },

  deleteReaction({ params }, res) {
    Thought.findOneAndUpdate(
        {_id: params.thoughtId}, 
        {$pull: {reactions: {reactionId: params.reactionId}}}, 
        {new: true})
    .then(dbThoughtData => {
        if (!dbThoughtData) {
            res.status(404).json({ message: 'Failure'});
            return;
        }
        res.json(dbThoughtData);
    }).catch(err => res.json(err));
  }
};

module.exports = thoughtController;