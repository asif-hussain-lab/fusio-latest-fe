const fs = require('fs')

const incrementVersion = (version) => {
  const [major, minor, patch] = version.split('.').map(Number)

  if (patch < 9) {
    return `${major.toString().padStart(1, '0')}.${minor.toString().padStart(0, '0')}.${(patch + 1)
      .toString()
      .padStart(0, '0')}`
  } else if (minor < 9) {
    return `${major.toString().padStart(1, '0')}.${(minor + 1).toString().padStart(0, '0')}.0`
  } else {
    return `${(major + 1).toString().padStart(1, '0')}.0.0`
  }
}

fs.readFile('./package.json', function (err, content) {
  if (err) throw err
  const packageInfo = JSON.parse(content)
  const oldVersion = packageInfo.version
  packageInfo.version = incrementVersion(oldVersion)
  fs.writeFile('./package.json', JSON.stringify(packageInfo, null, 2), 'utf8', function (err) {
    if (err) {
      throw err
    } else {
      console.log('Build Number Incremented to ' + packageInfo.version + ' Successfully!')
    }
  })
})
