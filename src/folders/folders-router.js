const express = require('express')
const xss = require('xss')
const FoldersService = require('./folders-service')
const path = require('path')

const foldersRouter = express.Router()
const jsonParser = express.json()

const serializeFolder = folder => ({
    id: folder.id,
    name: xss(folder.name)
})

foldersRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        FoldersService.getAllFolders(knexInstance)
            .then(folders =>{
                res.json(folders.map(serializeFolder))
            })
            .catch(next)
    })

foldersRouter
    .route('/:folderID')
    .all((req, res, next) => {
        FoldersService.getFolderById(
          req.app.get('db'),
          req.params.folderID
        )
          .then(folder => {
            if (!folder) {
              return res.status(404).json({
                error: { message: `Folder doesn't exist` }
              })
            }
            res.folder = folder
            next()
          })
          .catch(next)
      })
      .get((req, res, next) => {
        res.json(serializeFolder(res.folder))
      })

module.exports = foldersRouter