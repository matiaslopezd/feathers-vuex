/*
eslint
@typescript-eslint/explicit-function-return-type: 0,
@typescript-eslint/no-explicit-any: 0
*/
import { assert } from 'chai'
import Vue from 'vue'
import Vuex from 'vuex'
import { feathersRestClient as feathers } from '../../test/fixtures/feathers-client'
import feathersVuex from '../../src/index'
import _pick from 'lodash.pick'

Vue.use(Vuex)

describe('makeServicePlugin', function() {
  it('registers the vuex module with options', function() {
    const serverAlias = 'default'
    const { makeServicePlugin, BaseModel } = feathersVuex(feathers, {
      serverAlias
    })

    const servicePath = 'todos'
    class Todo extends BaseModel {
      public servicePath = servicePath
    }
    const todosPlugin = makeServicePlugin({
      servicePath,
      Model: Todo,
      service: feathers.service(servicePath)
    })
    interface RootState {
      todos: { options: {} }
    }
    const store = new Vuex.Store<RootState>({ plugins: [todosPlugin] })

    const keys = Object.keys(store.state.todos)
    const received = _pick(store.state.todos, keys)
    const expected = {
      addOnUpsert: false,
      autoRemove: false,
      debug: false,
      copiesById: {},
      diffOnPatch: true,
      enableEvents: true,
      errorOnCreate: null,
      errorOnFind: null,
      errorOnGet: null,
      errorOnPatch: null,
      errorOnRemove: null,
      errorOnUpdate: null,
      idField: 'id',
      ids: [],
      isCreatePending: false,
      isFindPending: false,
      isGetPending: false,
      isPatchPending: false,
      isRemovePending: false,
      isUpdatePending: false,
      keepCopiesInStore: false,
      keyedById: {},
      modelName: 'Todo',
      nameStyle: 'short',
      namespace: 'todos',
      pagination: {},
      paramsForServer: [],
      preferUpdate: false,
      replaceItems: false,
      serverAlias: 'default',
      servicePath: 'todos',
      skipRequestIfExists: false,
      whitelist: []
    }

    assert.deepEqual(received, expected, 'The module was registered.')
  })

  it('sets up Model.store && service.FeathersVuexModel', function() {
    const serverAlias = 'default'
    const { makeServicePlugin, BaseModel } = feathersVuex(feathers, {
      serverAlias
    })

    const servicePath = 'todos'
    const service = feathers.service(servicePath)
    class Todo extends BaseModel {
      public servicePath = servicePath
    }
    const todosPlugin = makeServicePlugin({ servicePath, Model: Todo, service })
    const store = new Vuex.Store({ plugins: [todosPlugin] })

    assert(Todo.store === store, 'the store is on the Model!')
    assert.equal(service.FeathersVuexModel, Todo, 'Model accessible on service')
  })

  it('allows accessing other models', function() {
    const serverAlias = 'default'
    const { makeServicePlugin, BaseModel, models } = feathersVuex(feathers, {
      idField: '_id',
      serverAlias
    })

    const servicePath = 'todos'
    class Todo extends BaseModel {
      public servicePath = servicePath
    }
    const todosPlugin = makeServicePlugin({
      servicePath,
      Model: Todo,
      service: feathers.service(servicePath)
    })

    const store = new Vuex.Store({
      plugins: [todosPlugin]
    })

    assert(models[serverAlias][Todo.name] === Todo)
    assert(Todo.store === store)
  })
})